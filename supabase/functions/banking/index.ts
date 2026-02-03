import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as jose from "https://deno.land/x/jose@v4.11.1/index.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENABLE_BANKING_BASE_URL = "https://api.enablebanking.com"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Unauthorized')

        const { action, ...params } = await req.json()

        // 1. JWT Generation for Enable Banking
        const getAuthHeader = async () => {
            const appId = Deno.env.get('ENABLE_BANKING_APPLICATION_ID')
            const privateKeyPem = Deno.env.get('ENABLE_BANKING_PRIVATE_KEY')
            if (!appId || !privateKeyPem) throw new Error('Missing Enable Banking configuration')

            const privateKey = await jose.importPKCS8(privateKeyPem, 'RS256')

            const jwt = await new jose.SignJWT({})
                .setProtectedHeader({ alg: 'RS256', kid: appId, typ: 'JWT' })
                .setIssuedAt()
                .setIssuer(appId)
                .setAudience(ENABLE_BANKING_BASE_URL)
                .setExpirationTime('1h')
                .sign(privateKey)

            return `Bearer ${jwt}`
        }

        if (action === 'list-institutions') {
            const auth = await getAuthHeader()
            const country = params.country || 'FR'
            const resp = await fetch(`${ENABLE_BANKING_BASE_URL}/aspsps?country=${country}`, {
                headers: { 'Authorization': auth },
            })
            const data = await resp.json()
            return new Response(JSON.stringify(data.aspsps || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'create-link') {
            const auth = await getAuthHeader()
            const { aspspId, redirectUrl } = params

            const resp = await fetch(`${ENABLE_BANKING_BASE_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aspsp: { name: aspspId, country: 'FR' }, // Simplification pour ZenBudget
                    redirect_url: redirectUrl,
                    state: crypto.randomUUID(),
                    access: {
                        valid_until: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days
                    }
                })
            })
            const session = await resp.json()

            // Store in DB
            await supabase.from('bank_connections').insert({
                user_id: user.id,
                requisition_id: session.session_id,
                institution_id: aspspId,
                status: 'initiated'
            })

            return new Response(JSON.stringify({ link: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'finalize-connection') {
            const auth = await getAuthHeader()
            const { code } = params // The code returned in callback

            const resp = await fetch(`${ENABLE_BANKING_BASE_URL}/sessions/finalize`, {
                method: 'POST',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            })

            if (!resp.ok) {
                const errorData = await resp.json()
                throw new Error(`Enable Banking Finalize Error: ${errorData.message || resp.statusText}`)
            }

            const result = await resp.json()
            const sessionId = result.session_id

            // Update connection in DB with the final session_id
            await supabase.from('bank_connections')
                .update({ status: 'linked', requisition_id: sessionId })
                .eq('user_id', user.id)
                .eq('status', 'initiated')

            // Get accounts
            const accresp = await fetch(`${ENABLE_BANKING_BASE_URL}/accounts`, {
                headers: { 'Authorization': `Bearer ${sessionId}` }
            })

            if (!accresp.ok) {
                throw new Error(`Failed to fetch accounts: ${accresp.statusText}`)
            }

            const accountsData = await accresp.json()

            // Return accounts and sessionId to the frontend
            return new Response(JSON.stringify({
                accounts: accountsData.accounts || [],
                sessionId: sessionId
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'sync-transactions') {
            const { sessionId, accountId } = params // Enable Banking uses Session ID for data access

            const transresp = await fetch(`${ENABLE_BANKING_BASE_URL}/accounts/${accountId}/transactions`, {
                headers: { 'Authorization': `Bearer ${sessionId}` },
            })
            const data = await transresp.json()

            return new Response(JSON.stringify({ transactions: data.transactions || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        throw new Error('Invalid action')

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

import { supabase } from '../lib/supabase'
import { type Transaction } from '../features/inbox/components/TransactionCard'

export interface BankInstitution {
    id: string
    name: string
    bic: string
    transaction_total_days: string
    countries: string[]
    logo: string
}

export interface BankAccount {
    id: string
    external_id: string
    iban?: string
    name?: string
    owner_name?: string
    currency: string
}

export const bankingService = {
    /**
     * List available banks for a country
     */
    async listInstitutions(country: string = 'FR'): Promise<BankInstitution[]> {
        const { data, error } = await supabase.functions.invoke('banking', {
            body: { action: 'list-institutions', country }
        })
        if (error) throw error
        // Enable Banking returns aspsps with 'name' (id) and 'title' (display name)
        return data.map((b: any) => ({
            id: b.name,
            name: b.title || b.name,
            bic: b.bic,
            logo: b.logo_url,
            countries: [country]
        }))
    },

    /**
     * Create a connection link for a specific institution
     */
    async createConnectionLink(aspspId: string, redirectUrl: string): Promise<string> {
        const { data, error } = await supabase.functions.invoke('banking', {
            body: { action: 'create-link', aspspId, redirectUrl }
        })
        if (error) throw error
        return data.link
    },

    /**
     * Finalize connection after bank redirection
     */
    async finalizeConnection(code: string): Promise<{ accounts: BankAccount[], sessionId: string }> {
        const { data, error } = await supabase.functions.invoke('banking', {
            body: { action: 'finalize-connection', code }
        })
        if (error) throw error
        return {
            accounts: data.accounts.map((a: any) => ({
                id: a.name, // In EB, name is the unique id for data retrieval
                external_id: a.name,
                iban: a.iban,
                name: a.title || a.name,
                owner_name: a.owner_name,
                currency: a.currency
            })),
            sessionId: data.sessionId
        }
    },

    /**
     * Map a bank account to an internal account
     */
    async mapAccount(connectionId: string, externalAccountId: string, internalAccountId: string): Promise<void> {
        const { error } = await supabase
            .from('bank_accounts')
            .insert({
                connection_id: connectionId,
                account_id: internalAccountId,
                external_id: externalAccountId
            })
        if (error) throw error
    },

    /**
     * Sync transactions for an account and map them to Internal Transaction model
     */
    async syncTransactions(_accountId: string, externalId: string, sessionId: string): Promise<Transaction[]> {
        const { data, error } = await supabase.functions.invoke('banking', {
            body: { action: 'sync-transactions', accountId: externalId, sessionId }
        })
        if (error) throw error

        const transactions = data.transactions || []

        return transactions.map((tx: any) => {
            const amount = parseFloat(tx.transaction_amount?.amount || '0')
            return {
                id: crypto.randomUUID(),
                amount: amount,
                description: tx.remittance_information_unstructured || tx.creditor_name || 'Transaction Bancaire',
                date: new Date(tx.booking_date || tx.value_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                raw_date: tx.booking_date || tx.value_date,
                status: 'pending',
                predicted_category: 'À définir',
                external_id: tx.transaction_id || tx.entry_reference
            } as Transaction
        })
    },

    /**
     * Get active connections for the current user
     */
    async getActiveConnections() {
        const { data, error } = await supabase
            .from('bank_connections')
            .select('*, bank_accounts(*)')
            .eq('status', 'linked')

        if (error) throw error
        return data
    },

    /**
     * Save synced transactions to the database
     */
    async saveTransactions(transactions: Transaction[], accountId: string): Promise<void> {
        const toInsert = transactions.map(tx => ({
            account_id: accountId,
            amount: tx.amount,
            description: tx.description,
            status: 'pending',
            transaction_date: tx.raw_date,
            external_id: tx.external_id
        }))

        // Use upsert to avoid duplicates based on external_id
        const { error } = await supabase
            .from('transactions')
            .upsert(toInsert, { onConflict: 'external_id' })

        if (error) throw error
    }
}

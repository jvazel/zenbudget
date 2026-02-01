import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    zen_mode_enabled: boolean
    base_monthly_income: number
    onboarding_completed: boolean
    guide_dismissed: boolean
}

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (pError) throw pError
            setProfile({
                ...data,
                base_monthly_income: Number(data.base_monthly_income || 0)
            })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // If we are updating base_monthly_income, we might also want to mark onboarding as completed
            const finalUpdates = { ...updates }
            if (updates.base_monthly_income !== undefined) {
                finalUpdates.onboarding_completed = true
            }

            const { error: uError } = await supabase
                .from('profiles')
                .update(finalUpdates)
                .eq('id', user.id)

            if (uError) throw uError

            // Refresh local state
            setProfile(prev => prev ? { ...prev, ...finalUpdates } : null)
            return true
        } catch (e: any) {
            setError(e.message)
            return false
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    return { profile, loading, error, updateProfile, refreshProfile: fetchProfile }
}

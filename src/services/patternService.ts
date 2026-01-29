import { supabase } from '../lib/supabase'

export interface TransactionPattern {
    id: string
    pattern_text: string
    category_id: string
}

export const patternService = {
    /**
     * Learns a pattern from a validated transaction.
     * Heuristic: Takes the first 2 words of the description as the pattern key.
     */
    async learnPattern(description: string, categoryId: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Simple heuristic: normalize & take first 2 words
            // e.g. "PRLV NETFLIX 123" -> "PRLV NETFLIX"
            const cleanDesc = description.trim().toUpperCase().replace(/\s+/g, ' ')
            const words = cleanDesc.split(' ')
            const patternText = words.length > 1 ? `${words[0]} ${words[1]}` : words[0]

            if (!patternText || patternText.length < 3) return // Ignore too short

            console.info(`[ZenButler] Learning: "${patternText}" -> ${categoryId}`)

            const { error } = await supabase
                .from('transaction_patterns')
                .upsert({
                    user_id: user.id,
                    pattern_text: patternText,
                    category_id: categoryId
                }, {
                    onConflict: 'user_id, pattern_text'
                })

            if (error) throw error
        } catch (e) {
            console.error('[ZenButler] Failed to learn pattern:', e)
        }
    },

    /**
     * Tries to find a matching category for a transaction description.
     */
    async findPattern(description: string): Promise<{ categoryId: string, categoryName?: string, categoryIcon?: string, categoryColor?: string } | null> {
        try {
            // We fetch all patterns for the user (assuming reasonable count < 1000)
            // and do best-match in memory to avoid complex SQL regex for now
            const { data: patterns, error } = await supabase
                .from('transaction_patterns')
                .select('pattern_text, category_id, categories(name, icon, color)')

            if (error) throw error
            if (!patterns || patterns.length === 0) return null

            const cleanDesc = description.trim().toUpperCase()

            // Find longest matching pattern
            // e.g. Pattern "UBER" matches "UBER EATS" and "UBER TRIP"
            const match = patterns.find(p => cleanDesc.startsWith(p.pattern_text))

            if (match) {
                // Supabase joins can return array or object depending on relationship.
                // Safely handle both.
                const cat = Array.isArray(match.categories) ? match.categories[0] : match.categories
                console.info(`[ZenButler] Match found: "${description}" matches pattern "${match.pattern_text}"`)
                return {
                    categoryId: match.category_id,
                    categoryName: cat?.name,
                    categoryIcon: cat?.icon,
                    categoryColor: cat?.color
                }
            }

            return null
        } catch (e) {
            console.error('[ZenButler] Failed to find pattern:', e)
            return null
        }
    }
}

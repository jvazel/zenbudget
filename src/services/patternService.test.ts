import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { patternService } from './patternService'
import { supabase } from '../lib/supabase'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn()
        },
        from: vi.fn()
    },
    isConfigured: true
}))

describe('patternService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('learnPattern', () => {
        it('should extract first two words as pattern', async () => {
            const mockUpsert = vi.fn().mockResolvedValue({ error: null })
            const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert })
                ; (supabase.from as any).mockImplementation(mockFrom)
                ; (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })

            await patternService.learnPattern('NETFLIX ABONNEMENT JANVIER', 'cat-loisirs')

            expect(mockFrom).toHaveBeenCalledWith('transaction_patterns')
            expect(mockUpsert).toHaveBeenCalledWith({
                user_id: 'user-123',
                pattern_text: 'NETFLIX ABONNEMENT', // First 2 words
                category_id: 'cat-loisirs'
            }, expect.any(Object))
        })

        it('should handle single word descriptions', async () => {
            const mockUpsert = vi.fn().mockResolvedValue({ error: null })
            const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert })
                ; (supabase.from as any).mockImplementation(mockFrom)
                ; (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })

            await patternService.learnPattern('UBER', 'cat-transport')

            expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
                pattern_text: 'UBER'
            }), expect.any(Object))
        })

        it('should ignore descriptions shorter than 3 chars', async () => {
            const mockFrom = vi.fn()
                ; (supabase.from as any).mockImplementation(mockFrom)
                ; (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })

            await patternService.learnPattern('AB', 'cat-unknown')

            expect(mockFrom).not.toHaveBeenCalled()
        })
    })

    describe('findPattern', () => {
        it('should return matching category for known pattern (exact start)', async () => {
            const mockPatterns = [
                { pattern_text: 'NETFLIX', category_id: 'cat-loisirs', categories: { name: 'Loisirs', icon: 'Sparkles', color: 'red' } }
            ]
            const mockSelect = vi.fn().mockResolvedValue({ data: mockPatterns, error: null })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
                ; (supabase.from as any).mockImplementation(mockFrom)

            const result = await patternService.findPattern('NETFLIX MONTHLY')

            expect(result).toEqual({
                categoryId: 'cat-loisirs',
                categoryName: 'Loisirs',
                categoryIcon: 'Sparkles',
                categoryColor: 'red'
            })
        })

        it('should be case insensitive', async () => {
            const mockPatterns = [
                { pattern_text: 'UBER', category_id: 'cat-transport', categories: { name: 'Transport' } }
            ]
            const mockSelect = vi.fn().mockResolvedValue({ data: mockPatterns, error: null })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
                ; (supabase.from as any).mockImplementation(mockFrom)

            const result = await patternService.findPattern('uber eats')

            expect(result).toEqual(expect.objectContaining({
                categoryId: 'cat-transport'
            }))
        })

        it('should return null if no match found', async () => {
            const mockPatterns = [
                { pattern_text: 'AUCHAN', category_id: 'cat-food' }
            ]
            const mockSelect = vi.fn().mockResolvedValue({ data: mockPatterns, error: null })
            const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
                ; (supabase.from as any).mockImplementation(mockFrom)

            const result = await patternService.findPattern('CARREFOUR CITY')

            expect(result).toBeNull()
        })
    })
})

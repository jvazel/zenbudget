import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, ArrowRightLeft } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

export const ZenCategoryFlow: React.FC = () => {
    const [trends, setTrends] = useState<{ month: string, fullMonth: string, categories: Record<string, number> }[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'expense' | 'income'>('expense')
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const data = await transactionService.getCategoryTrends(6, viewMode)
            setTrends(data)
            setLoading(false)
        }
        load()
    }, [viewMode])

    if (loading) return (
        <div className="glass rounded-3xl p-6 border border-white/5 h-64 flex items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">Chargement du flux...</p>
        </div>
    )

    // Data Preparation for Stacked Area Chart
    const categories = Object.keys(trends[0]?.categories || {})
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'] // Cyan, Blue, Violet, Pink, Orange

    // Calculate Grid Scaling
    const maxTotal = Math.max(...trends.map((t: any) =>
        Object.values(t.categories).reduce((a: number, b: number) => a + b, 0)
    )) * 1.1



    // Generate Path Data for each category
    const getPath = (catIndex: number) => {
        let path = ''

        // Top calculation (cumulative)
        const getPoint = (trendIndex: number, isBottom: boolean) => {
            const t = trends[trendIndex]
            let y = 0

            // Sum up to current category for top Y, or previous categories for bottom Y
            const limit = isBottom ? catIndex : catIndex + 1
            for (let i = 0; i < limit; i++) {
                y += t.categories[categories[i]]
            }

            const xVal = (trendIndex / (trends.length - 1)) * 100
            const yVal = 100 - (y / maxTotal * 100) // Invert Y for SVG
            return `${xVal},${yVal}`
        }

        // Build Polygon: Left-Right (Top Line) -> Right-Left (Bottom Line)

        // Top Line (Forward)
        trends.forEach((_, i) => {
            const point = getPoint(i, false)
            path += (i === 0 ? 'M' : 'L') + point + ' '
        })

        // Bottom Line (Backward)
        for (let i = trends.length - 1; i >= 0; i--) {
            const point = getPoint(i, true)
            path += 'L' + point + ' '
        }

        path += 'Z' // Close path
        return path
    }

    return (
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-[#06b6d4]" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Fleuve des Flux</h2>
                </div>

                <button
                    onClick={() => setViewMode((prev) => prev === 'expense' ? 'income' : 'expense')}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {viewMode === 'expense' ? 'Dépenses' : 'Recettes'}
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-[#06b6d4]" />
                </button>
            </div>

            <div className="relative h-48 w-full select-none" onMouseLeave={() => setHoveredIndex(null)}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(p => (
                        <line
                            key={p}
                            x1="0" y1={p} x2="100" y2={p}
                            stroke="white"
                            strokeOpacity="0.05"
                            strokeWidth="0.5"
                            strokeDasharray="2"
                        />
                    ))}

                    {/* Areas */}
                    {categories.map((cat, i) => (
                        <motion.path
                            key={cat}
                            d={getPath(i)}
                            fill={colors[i % colors.length]}
                            stroke="white"
                            strokeWidth="0.2"
                            strokeOpacity="0.1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredIndex === null || hoveredIndex === i ? 0.8 : 0.2 }}
                            transition={{ duration: 0.5 }}
                            className="transition-opacity duration-300"
                        />
                    ))}

                    {/* Hover Interaction Areas (Transparent Columns) */}
                    {trends.map((_, i) => (
                        <rect
                            key={i}
                            x={(i / (trends.length - 1)) * 100 - (50 / (trends.length - 1))}
                            y="0"
                            width={100 / (trends.length - 1)}
                            height="100"
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(i)}
                            style={{ cursor: 'crosshair' }}
                        />
                    ))}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredIndex !== null && (
                    <div
                        className="absolute top-0 bottom-0 pointer-events-none flex flex-col justify-end pb-2 space-y-1"
                        style={{
                            left: `${(hoveredIndex / (trends.length - 1)) * 100}%`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {/* Vertical Line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 border-r border-dashed border-white/20 h-full" />

                        <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl space-y-2 min-w-[120px] relative z-20">
                            <p className="text-[10px] text-center font-bold uppercase text-white/50 mb-1 border-b border-white/10 pb-1">
                                {trends[hoveredIndex].fullMonth}
                            </p>
                            {categories.slice().reverse().map((cat, i) => {
                                const realIndex = categories.length - 1 - i
                                const amount = trends[hoveredIndex].categories[cat]
                                if (amount === 0) return null
                                return (
                                    <div key={cat} className="flex justify-between items-center text-[9px] gap-4">
                                        <div className="flex items-center space-x-1.5 ">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[realIndex % colors.length] }} />
                                            <span className="opacity-80">{cat}</span>
                                        </div>
                                        <span className="font-mono font-bold">{amount}€</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((cat, i) => (
                    <div
                        key={cat}
                        className={`flex items-center space-x-1.5 cursor-pointer transition-opacity ${hoveredIndex !== null ? 'opacity-40' : 'opacity-100'}`}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { MarketData } from "@/lib/api/market"
import Link from "next/link"

interface MarketOverviewProps {
    indices: MarketData[]
}

export function MarketOverview({ indices }: MarketOverviewProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {indices.map((index, i) => {
                const isPositive = index.regularMarketChange >= 0
                return (
                    <Link href={`/dashboard/market/${encodeURIComponent(index.symbol)}`} key={index.symbol} className="block transition-transform hover:scale-[1.02]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="h-full"
                        >
                            <GlassCard className="p-6 relative overflow-hidden group h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {isPositive ? <TrendingUp className="w-12 h-12" /> : <Activity className="w-12 h-12" />}
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{index.shortName || index.symbol}</p>
                                        <h3 className="text-xl font-bold font-heading mt-1">{index.symbol}</h3>
                                    </div>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border backdrop-blur-sm",
                                            isPositive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        )}
                                    >
                                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                        {Math.abs(index.regularMarketChangePercent).toFixed(2)}%
                                    </div>
                                </div>

                                <div className="mt-6 relative z-10">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-mono font-bold tracking-tight">{index.regularMarketPrice.toLocaleString()}</span>
                                        <span className={cn("text-xs font-medium", isPositive ? 'text-green-500' : 'text-red-500')}>
                                            {isPositive ? '+' : ''}{index.regularMarketChange.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Decorative Glow */}
                                <div
                                    className={cn(
                                        "absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20",
                                        isPositive ? "bg-green-500" : "bg-red-500"
                                    )}
                                />
                            </GlassCard>
                        </motion.div>
                    </Link>
                )
            })}
        </div>
    )
}

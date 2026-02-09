"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Info, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Layers, Target } from "lucide-react"
import { MarketData } from "@/lib/api/market"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface StockInfoConsoleProps {
    watchlistData: MarketData[]
}

export function StockInfoConsole({ watchlistData }: StockInfoConsoleProps) {
    const searchParams = useSearchParams()
    const activeSymbol = searchParams.get('chartSymbol') || (watchlistData.length > 0 ? watchlistData[0].symbol : "NVDA")

    const stock = watchlistData.find(s => s.symbol === activeSymbol)

    if (!stock) return null

    const stats = [
        { label: "Sector", value: stock.sector || "-", icon: Layers },
        { label: "Prev Close", value: stock.regularMarketPreviousClose?.toFixed(2) || "-", icon: Target },
        { label: "Day Range", value: `${stock.regularMarketDayLow?.toFixed(2)} - ${stock.regularMarketDayHigh?.toFixed(2)}`, icon: Activity },
        { label: "52W Range", value: `${stock.fiftyTwoWeekLow?.toFixed(2)} - ${stock.fiftyTwoWeekHigh?.toFixed(2)}`, icon: Target },
        { label: "Market Cap", value: stock.marketCap ? (stock.marketCap / 1e9).toFixed(2) + 'B' : '-', icon: Layers },
        { label: "Volume", value: stock.regularMarketVolume?.toLocaleString() || '-', icon: BarChart3 },
        { label: "Avg Vol (3M)", value: stock.averageDailyVolume3Month?.toLocaleString() || '-', icon: BarChart3 },
        { label: "P/E (Trailing)", value: stock.trailingPE?.toFixed(2) || '-', icon: PieChart },
        { label: "Div Yield", value: stock.dividendYield ? (stock.dividendYield * 100).toFixed(2) + '%' : '-', icon: TrendingUp },
    ]

    return (
        <GlassCard className="p-5 relative overflow-hidden border-white/5 bg-[#050507]/40" gradient>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />

            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg font-bold tracking-tight uppercase leading-none">
                            Asset HUD
                        </h3>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-2">
                            {stock.symbol} <span className="opacity-40">//</span> {stock.shortName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest leading-none">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="group p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] transition-all duration-150"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors duration-150" />
                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest group-hover:text-muted-foreground/60 transition-colors duration-150 truncate">
                                {stat.label}
                            </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-white/80 group-hover:text-primary transition-colors duration-150 truncate">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between opacity-40">
                <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                    STS: NOMINAL
                </div>
                <div className="text-[10px] font-bold text-primary/30">
                    CORTEX v4.2
                </div>
            </div>
        </GlassCard>
    )
}

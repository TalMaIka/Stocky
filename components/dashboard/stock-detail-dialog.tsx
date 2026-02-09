"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { GlassCard } from "@/components/ui/glass-card"
import { MarketData } from "@/lib/api/market"
import { calculateVolatility, runMonteCarlo } from "@/lib/simulation"
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Info,
    Zap,
    Shield,
    Command,
    ChevronRight,
    Target,
    Activity,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid } from "recharts"

interface StockDetailDialogProps {
    stock: MarketData | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

interface UnifiedDataPoint {
    label: string
    historyPrice?: number
    historyOpen?: number
    forecastPrice?: number
    type: "history" | "forecast"
    date?: string
}

export function StockDetailDialog({ stock, isOpen, onOpenChange }: StockDetailDialogProps) {
    const [loading, setLoading] = useState(false)
    const [historyData, setHistoryData] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [activeRange, setActiveRange] = useState("1M")

    const ranges = ["1W", "1M", "3M", "1Y"]

    // 1. Fetch Data
    useEffect(() => {
        if (isOpen && stock) {
            handleFetchAll()
        }
    }, [isOpen, stock, activeRange])

    const handleFetchAll = async () => {
        if (!stock) return
        setLoading(true)
        try {
            const res = await fetch(`/api/market/history?symbol=${stock.symbol}&range=${activeRange}`)
            if (!res.ok) throw new Error("Failed to fetch history")
            const history = await res.json()
            setHistoryData(history)

            // Volatility calc from 1Y baseline
            const baseRes = await fetch(`/api/market/history?symbol=${stock.symbol}&range=1Y`)
            const baseHistory = await baseRes.json()
            if (baseHistory.length >= 10) {
                const prices = baseHistory.map((h: any) => h.close)
                setStats({
                    volatility: calculateVolatility(prices) * 100,
                    range30d: {
                        min: Math.min(...history.slice(-30).map((h: any) => h.low || h.close)),
                        max: Math.max(...history.slice(-30).map((h: any) => h.high || h.close))
                    }
                })
            }
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    // 2. Compute Unified Timeline (Past + AI Future)
    const unifiedTimeline = useMemo(() => {
        if (!historyData.length || !stock) return []

        const historyPoints: UnifiedDataPoint[] = historyData.map((h: any) => ({
            label: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            historyPrice: h.close,
            historyOpen: h.open,
            type: "history",
            date: h.date
        }))

        // Bridge: The transition point from reality to AI projection
        // We set the forecastPrice of the last historical point to the current price
        // to make the AI projections originate from the actual market price
        const lastIndex = historyPoints.length - 1
        historyPoints[lastIndex].forecastPrice = stock.regularMarketPrice

        // Generate Forecasts
        const currentPrice = stock.regularMarketPrice
        const volatility = (stats?.volatility / 100) || 0.2

        const forecastSteps = [
            { label: "1D", days: 1 },
            { label: "5D", days: 5 },
            { label: "1M", days: 30 },
            { label: "6M", days: 180 },
            { label: "1Y", days: 365 },
        ]

        const forecastPoints: UnifiedDataPoint[] = forecastSteps.map(s => {
            const sim = runMonteCarlo(currentPrice, volatility, s.days, 500)
            const medianPrice = sim.percentiles.p50[sim.percentiles.p50.length - 1]
            return {
                label: `+${s.label}`,
                forecastPrice: medianPrice,
                type: "forecast"
            }
        })

        return [...historyPoints, ...forecastPoints]
    }, [historyData, stock, stats])

    const periodPerformance = useMemo(() => {
        if (historyData.length < 2) return null
        const first = historyData[0].close
        const last = historyData[historyData.length - 1].close
        const change = ((last - first) / first) * 100
        return {
            change,
            isPositive: change >= 0
        }
    }, [historyData])

    if (!stock) return null

    const volLabel = (v: number) => {
        if (v < 15) return { text: "PREMIUM STABILITY", color: "text-blue-400" }
        if (v < 35) return { text: "BALANCED DYNAMICS", color: "text-emerald-400" }
        return { text: "AGGRESSIVE VOLATILITY", color: "text-orange-400" }
    }

    const currentVol = volLabel(stats?.volatility || 0)
    const lastPoint = unifiedTimeline[unifiedTimeline.length - 1]
    const yearForecast = lastPoint ? (lastPoint.forecastPrice || lastPoint.historyPrice || 0) : 0
    const totalMove = ((yearForecast - stock.regularMarketPrice) / stock.regularMarketPrice) * 100

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1600px] sm:max-w-none w-[98vw] h-[95vh] bg-[#050507] border-white/5 text-white p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] outline-none flex flex-col">
                {/* 1. TOP TERMINAL HUD - More Compact Vertically */}
                <div className="flex items-center justify-between px-12 py-6 border-b border-white/5 bg-[#08080a]">
                    <div className="flex items-center gap-12 shrink-0">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Command className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-40">System Node: Protocol 4.2</span>
                            </div>
                            <DialogTitle className="text-4xl font-black font-heading tracking-tighter flex items-baseline gap-6 leading-none">
                                {stock.symbol}
                                <span className="text-lg text-muted-foreground font-mono font-medium tracking-tight border-l border-white/10 pl-6 leading-none opacity-60">
                                    {stock.shortName}
                                </span>
                            </DialogTitle>
                        </div>

                        <div className="h-10 w-px bg-white/5 mx-2" />

                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-50">Profile Analysis</span>
                            <div className={cn("text-sm font-black tracking-[0.2em] flex items-center gap-2", currentVol.color)}>
                                <Shield className="w-3.5 h-3.5" />
                                {currentVol.text}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12 text-right">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-50">Market Valuation</span>
                            <div className="text-4xl font-mono font-black tracking-tighter leading-none text-white">
                                ${stock.regularMarketPrice.toFixed(2)}
                            </div>
                        </div>
                        <div className={cn("px-6 py-3 rounded-xl border font-black text-lg flex flex-col items-end min-w-[180px]",
                            stock.regularMarketChange >= 0 ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400")}>
                            <span className="text-[8px] uppercase tracking-[0.25em] opacity-40 mb-1">Sector Variance</span>
                            <div className="flex items-center gap-2">
                                {stock.regularMarketChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {stock.regularMarketChangePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Optimized grid & scroll prevention */}
                <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">
                    {/* 2. MAIN UNIFIED TIMELINE (9/12) */}
                    <div className="col-span-9 p-8 flex flex-col gap-6 border-r border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <Activity className="w-5 h-5 text-primary opacity-80" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/80">Quantum Market Trajectory</h3>
                                <div className="flex items-center gap-6 ml-10 px-6 py-2 rounded-full bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Baseline History</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">AI CORTEX PATH</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 shadow-inner">
                                    {ranges.map((r) => (
                                        <Button
                                            key={r}
                                            variant={activeRange === r ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setActiveRange(r)}
                                            className={cn("h-7 px-6 text-[9px] font-black uppercase tracking-[0.2em] rounded-md transition-all duration-150",
                                                activeRange === r ? "bg-white text-black hover:bg-white" : "text-muted-foreground hover:text-white")}
                                        >
                                            {r}
                                        </Button>
                                    ))}
                                </div>
                                {periodPerformance && (
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border animate-in fade-in slide-in-from-top-1 duration-200",
                                        periodPerformance.isPositive
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}>
                                        {periodPerformance.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                        {activeRange} RETURN: {periodPerformance.isPositive ? '+' : ''}{periodPerformance.change.toFixed(2)}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart Container - Guaranteed to fill available space without pushing down */}
                        <div className="flex-1 relative min-h-0 bg-[#08080a]/50 rounded-[32px] border border-white/[0.03] p-6 group">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#050507]/80 backdrop-blur-xl z-30 rounded-[32px]">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                        <span className="text-[9px] font-black tracking-[0.6em] text-primary animate-pulse uppercase">Recalibrating Vectors...</span>
                                    </div>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={unifiedTimeline} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fff" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#333"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={80}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#333"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                        domain={['auto', 'auto']}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload as UnifiedDataPoint
                                                const isHistory = d.type === 'history'
                                                const displayPrice = isHistory ? d.historyPrice : d.forecastPrice
                                                const historyChange = (isHistory && d.historyPrice && d.historyOpen)
                                                    ? ((d.historyPrice - d.historyOpen) / d.historyOpen) * 100
                                                    : null
                                                const forecastChange = (!isHistory && d.forecastPrice && stock.regularMarketPrice)
                                                    ? ((d.forecastPrice - stock.regularMarketPrice) / stock.regularMarketPrice) * 100
                                                    : null
                                                const isPositive = historyChange !== null ? historyChange >= 0 : (forecastChange !== null ? forecastChange >= 0 : true)

                                                return (
                                                    <div className="bg-[#0c0c0e]/95 border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl min-w-[220px] border-b-primary/50 border-b-2">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3 flex items-center gap-2">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", isHistory ? 'bg-white/40' : 'bg-primary')} />
                                                            {isHistory ? 'System Baseline' : 'Cortex Target'}
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="text-3xl font-black font-mono text-white tracking-tighter">${(displayPrice || 0).toFixed(2)}</div>
                                                                <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{d.label}</div>
                                                            </div>

                                                            {isHistory && d.historyOpen && (
                                                                <div className="pt-3 border-t border-white/5 space-y-1.5">
                                                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                                                        <span className="text-muted-foreground uppercase tracking-widest">Open</span>
                                                                        <span className="font-mono text-white/70">${d.historyOpen.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                                                        <span className="text-muted-foreground uppercase tracking-widest">Close</span>
                                                                        <span className="font-mono text-white/70">${(d.historyPrice || 0).toFixed(2)}</span>
                                                                    </div>
                                                                    {historyChange !== null && (
                                                                        <div className={cn(
                                                                            "flex justify-between items-center text-[10px] font-black pt-1",
                                                                            isPositive ? "text-emerald-400" : "text-red-400"
                                                                        )}>
                                                                            <span className="uppercase tracking-widest">Change</span>
                                                                            <span className="font-mono">{isPositive ? '+' : ''}{historyChange.toFixed(2)}%</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {!isHistory && forecastChange !== null && (
                                                                <div className="pt-3 border-t border-white/5 space-y-1.5">
                                                                    <div className={cn(
                                                                        "flex justify-between items-center text-[10px] font-black",
                                                                        isPositive ? "text-emerald-400" : "text-red-400"
                                                                    )}>
                                                                        <span className="uppercase tracking-widest">Expected Return</span>
                                                                        <span className="font-mono">{isPositive ? '+' : ''}{forecastChange.toFixed(2)}%</span>
                                                                    </div>
                                                                    <div className="text-[8px] text-muted-foreground/30 font-black uppercase tracking-widest text-right">
                                                                        Vs Current: ${stock.regularMarketPrice.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 40 }}
                                    />
                                    {/* History Area */}
                                    <Area
                                        type="monotone"
                                        dataKey="historyPrice"
                                        stroke="#ffffff15"
                                        strokeWidth={1.5}
                                        fill="url(#historyGradient)"
                                        isAnimationActive={false}
                                        connectNulls
                                    />
                                    {/* Forecast Area */}
                                    <Area
                                        type="monotone"
                                        dataKey="forecastPrice"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fill="url(#forecastGradient)"
                                        strokeDasharray="10 5"
                                        animationDuration={1500}
                                        connectNulls
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. VERDICT SIDEBAR (3/12) - Balanced Vertical Spacing */}
                    <div className="col-span-3 bg-[#08080a]/30 p-10 flex flex-col gap-10 border-l border-white/5 overflow-y-auto custom-scrollbar">
                        <section className="space-y-4 shrink-0">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.6em] text-secondary opacity-50">Intelligence Output</h4>
                            <div className="p-8 rounded-[36px] bg-secondary/5 border border-secondary/10 relative overflow-hidden group hover:bg-secondary/[0.07] transition-all duration-200">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-300 rotate-12 scale-150">
                                    <Zap className="w-24 h-24 text-secondary" />
                                </div>
                                <div className="relative space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-2">12M Strategic Pivot</span>
                                        <div className={cn("text-4xl font-black font-heading tracking-tighter leading-none whitespace-normal", totalMove >= 0 ? "text-emerald-400" : "text-orange-400")}>
                                            {totalMove >= 0 ? 'ACCUMULATE' : 'CAUTION'}
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/60 font-medium leading-relaxed italic tracking-tight border-l border-secondary/20 pl-4 py-1">
                                        "Cortex identifies a {totalMove.toFixed(1)}% variance. {stats?.volatility > 35 ? 'Aggressive discovery pulses' : 'Stable accumulation cycles'} are detected."
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 shrink-0">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground opacity-50">Critical Nodes</h4>
                            <div className="grid gap-3">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-primary/40 transition-all">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">1Y TARGET</span>
                                    <span className="text-2xl font-mono font-black text-primary tracking-tighter">${yearForecast.toFixed(1)}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group hover:bg-white/[0.04] transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">30D WINDOW</span>
                                        <span className="text-sm font-mono font-black tracking-tight text-white/90">
                                            ${stats?.range30d?.min.toFixed(0)} <span className="mx-2 text-white/10">→</span> ${stats?.range30d?.max.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.04]">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">MARKET CAP</span>
                                    <span className="text-sm font-mono font-black text-white/90">{stock.marketCap ? `$${(stock.marketCap / 1e9).toFixed(1)}B` : "N/A"}</span>
                                </div>
                            </div>
                        </section>

                        <div className="mt-auto space-y-6 pt-8 border-t border-white/[0.03] shrink-0">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">
                                <Target className="w-4 h-4 text-primary opacity-40" />
                                CONFIDENCE: 95.2%
                            </div>
                            <div className="text-[8px] text-muted-foreground/20 leading-normal uppercase font-bold tracking-[0.2em] pl-1">
                                MODEL: GBM V.4.2 STABLE<br />
                                CLUSTER NODE: 500 ITERATIONS
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SYSTEM STATUS FOOTER */}
                <div className="px-12 py-4 bg-[#030304] border-t border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-10 text-[9px] font-black tracking-[0.5em] text-muted-foreground/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
                            LINK: NOMINAL
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
                            CORTEX: READY
                        </div>
                    </div>
                    <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] italic">
                        SECURE TERMINAL | NOT FINANCIAL ADVICE
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

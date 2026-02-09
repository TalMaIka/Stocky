"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GlassCard } from "@/components/ui/glass-card"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, TrendingDown, Percent } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface HistoricalDataPoint {
    date: string
    open: number
    close: number
}

export function StockChart() {
    const searchParams = useSearchParams()
    const urlSymbol = searchParams.get('chartSymbol')

    const [activeRange, setActiveRange] = useState("1M")
    const [data, setData] = useState<HistoricalDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    const symbol = urlSymbol || "NVDA"

    const ranges = ["1W", "1M", "3M", "1Y"]

    const periodPerformance = useMemo(() => {
        if (data.length < 2) return null
        const first = data[0].close
        const last = data[data.length - 1].close
        const change = ((last - first) / first) * 100
        return {
            change,
            isPositive: change >= 0
        }
    }, [data])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`/api/market/history?symbol=${symbol}&range=${activeRange}`)
                if (!res.ok) throw new Error("Failed to fetch")
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error(error)
                setData([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeRange, symbol])

    return (
        <GlassCard className="p-6 h-[600px] flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-heading text-xl font-bold">Performance Analysis</h3>
                    <p className="text-xs text-muted-foreground">{symbol} - Price History</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        {ranges.map((range) => (
                            <Button
                                key={range}
                                variant={activeRange === range ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setActiveRange(range)}
                                className={`h-7 px-3 text-xs ${activeRange === range ? 'bg-primary text-primary-foreground shadow-[0_0_10px_-2px_var(--primary)]' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'}`}
                            >
                                {range}
                            </Button>
                        ))}
                    </div>
                    {periodPerformance && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border animate-in fade-in slide-in-from-top-1 duration-200",
                            periodPerformance.isPositive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                            {periodPerformance.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {activeRange} Return: {periodPerformance.isPositive ? '+' : ''}{periodPerformance.change.toFixed(2)}%
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length && label) {
                                    const d = payload[0].payload as HistoricalDataPoint;
                                    const change = ((d.close - d.open) / d.open) * 100;
                                    const isPositive = change >= 0;

                                    return (
                                        <div className="bg-[#0c0c0e]/95 border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[180px]">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
                                                {new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Open</span>
                                                    <span className="font-mono font-medium">${d.open.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Close</span>
                                                    <span className="font-mono font-bold text-white">${d.close.toFixed(2)}</span>
                                                </div>
                                                <div className={cn(
                                                    "flex justify-between items-center text-sm pt-2 mt-2 border-t border-white/5 font-bold",
                                                    isPositive ? "text-emerald-400" : "text-red-400"
                                                )}>
                                                    <span className="flex items-center gap-1">
                                                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                        Change
                                                    </span>
                                                    <span className="font-mono">
                                                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}

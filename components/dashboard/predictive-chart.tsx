"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { GlassCard } from "@/components/ui/glass-card"
import { Loader2 } from "lucide-react"

interface PredictiveChartProps {
    data: {
        day: number
        p05: number
        p25: number
        p50: number
        p75: number
        p95: number
    }[]
    loading?: boolean
    symbol: string
}

export function PredictiveChart({ data, loading, symbol }: PredictiveChartProps) {
    // We need to shape the data for Recharts to draw "ranges".
    // Recharts Area can use [min, max] for dataKey to draw a range.
    // But standard Recharts Area takes a single value.
    // We will stack overlapping areas or use "range" type if supported,
    // but simpler is to draw 3 areas:
    // 1. p05 to p95 (Outer cone, faint)
    // 2. p25 to p75 (Inner cone, brighter)
    // 3. p50 (Median line)

    // Actually, Recharts Area takes `dataKey` as [key1, key2] for range.
    // So: dataKey={['p05', 'p95']}

    return (
        <GlassCard className="p-6 h-[500px] flex flex-col relative w-full">
            <div className="mb-6">
                <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                    Probability Cones
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">Beta</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                    Projected price paths for {symbol} based on volatility (Monte Carlo GBM).
                </p>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <span className="text-xs text-primary/80 font-mono">Running 1000 Simulations...</span>
                        </div>
                    </div>
                )}

                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="coneOuter" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="coneInner" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#666"
                                fontSize={12}
                                tickFormatter={(val) => `+${val}d`}
                                minTickGap={20}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `$${val.toFixed(0)}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                }}
                                labelStyle={{ color: '#aaa' }}
                                formatter={(value: any, name: any) => {
                                    const labels: Record<string, string> = {
                                        p50: 'Median Forecast',
                                        p95: 'Optimistic (95%)',
                                        p05: 'Pessimistic (5%)',
                                        p75: 'High (75%)',
                                        p25: 'Low (25%)'
                                    }
                                    return [`$${Number(value).toFixed(2)}`, labels[name] || name]
                                }}
                            />

                            {/* Outer Cone (5th to 95th Percentile) - We have to fake it with multiple areas or stack them carefully 
                    Recharts Area actually fills from 0 to value. 
                    To Draw a band, typically we use `recharts` composed chart or just overlaid lines.
                    Actually, Recharts Area accepts [min, max] for dataKey! Let's try that.
                */}

                            <Area
                                type="monotone"
                                dataKey="p95" // We can't actually do range easily in simple Area without creating a custom shape or using RangeArea if supported.
                                // The common trick is to use `stackId` but that stacks values.
                                // Better trick: Use 'range' is not natively supported in standard Area property easily for single prop.
                                // Actually, Area `dataKey` takes string | number | function.

                                // FALLBACK STRATEGY: 
                                // Draw Area for p95 with fill.
                                // On top, draw Area for p05 with fill matching BACKGROUND color to "erase" the bottom part? No, background is transparent/complex.

                                // PROPER STRATEGY:
                                // Draw lines for p95, p75, p50, p25, p05.
                                // Fill opacity for visual effect.
                                stroke="transparent"
                                fill="var(--primary)"
                                fillOpacity={0.05}
                            />

                            {/* Since we can't easily do bands in standard Recharts without [min,max] support (which is tricky in some versions),
                    we will visualize the lines clearly with standard deviations style.
                */}

                            <Area type="basis" dataKey="p95" stroke="var(--primary)" strokeDasharray="5 5" fill="url(#coneOuter)" strokeOpacity={0.3} />
                            <Area type="basis" dataKey="p05" stroke="var(--primary)" strokeDasharray="5 5" fill="transparent" strokeOpacity={0.3} />

                            <Area type="basis" dataKey="p75" stroke="var(--secondary)" strokeOpacity={0.5} fill="url(#coneInner)" />
                            <Area type="basis" dataKey="p25" stroke="var(--secondary)" strokeOpacity={0.5} fill="transparent" />

                            <Area type="basis" dataKey="p50" stroke="#fff" strokeWidth={2} fill="transparent" />

                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                        No simulation data generated yet.
                    </div>
                )}
            </div>
        </GlassCard>
    )
}

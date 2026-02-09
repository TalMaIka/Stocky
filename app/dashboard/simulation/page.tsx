"use client"

import { useState } from "react"
import { PredictiveChart } from "@/components/dashboard/predictive-chart"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { calculateVolatility, runMonteCarlo } from "@/lib/simulation"
import { Loader2, Play, RefreshCw, Cpu } from "lucide-react"

// Default simulation params
const DEFAULT_SIM = {
    symbol: "NVDA",
    days: 30,
    simulations: 1000,
    volatilityMultiplier: 1.0
}

export default function SimulationPage() {
    const [symbol, setSymbol] = useState(DEFAULT_SIM.symbol)
    const [days, setDays] = useState(DEFAULT_SIM.days)
    const [volMult, setVolMult] = useState(DEFAULT_SIM.volatilityMultiplier)
    const [loading, setLoading] = useState(false)
    const [chartData, setChartData] = useState<any[]>([])
    const [stats, setStats] = useState<{ volatility: number, lastPrice: number } | null>(null)

    const handleRunSimulation = async () => {
        setLoading(true)
        setStats(null)

        try {
            // 1. Fetch historical data (last 1 year to check volatility)
            const res = await fetch(`/api/market/history?symbol=${symbol}&range=1Y`)
            if (!res.ok) throw new Error("Failed to fetch history")
            const history = await res.json()

            if (history.length < 10) {
                alert("Not enough historical data for this symbol.")
                return
            }

            // 2. Calculate Volatility
            const prices = history.map((h: any) => h.close)
            const baseVol = calculateVolatility(prices)
            const lastPrice = prices[prices.length - 1]

            const adjustedVol = baseVol * volMult

            // 3. Run Monte Carlo
            // Artificial delay for effect (Cortex "Processing")
            await new Promise(r => setTimeout(r, 800))

            const result = runMonteCarlo(lastPrice, adjustedVol, days, 500)

            // 4. Format for Chart
            const formattedData = result.percentiles.p50.map((_, i) => ({
                day: i,
                p05: result.percentiles.p05[i],
                p25: result.percentiles.p25[i],
                p50: result.percentiles.p50[i],
                p75: result.percentiles.p75[i],
                p95: result.percentiles.p95[i],
            }))

            setChartData(formattedData)
            setStats({ volatility: baseVol, lastPrice })

        } catch (error) {
            console.error(error)
            alert("Simulation failed. Check symbol.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full pb-8">
            <header>
                <h1 className="text-3xl font-bold font-heading text-primary flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-secondary animate-pulse" />
                    Cortex Simulation Lab
                </h1>
                <p className="text-muted-foreground text-lg">
                    Predictive modeling using Monte Carlo Geometric Brownian Motion.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Controls */}
                <GlassCard className="lg:col-span-4 p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Asset</Label>
                            <Input
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                className="bg-white/5 border-white/10 font-mono text-lg tracking-wider"
                                placeholder="e.g. BTC-USD"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between">
                                <Label>Forecast Horizon (Days)</Label>
                                <span className="text-xs font-mono text-primary">{days}d</span>
                            </div>
                            <Slider
                                value={[days]}
                                min={7} max={365} step={1}
                                onValueChange={(vals: number[]) => setDays(vals[0])}
                                className="[&_.bg-primary]:bg-secondary"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between">
                                <Label>Volatility Multiplier (Scenario)</Label>
                                <span className="text-xs font-mono text-primary">{volMult.toFixed(1)}x</span>
                            </div>
                            <Slider
                                value={[volMult]}
                                min={0.5} max={3.0} step={0.1}
                                onValueChange={(vals: number[]) => setVolMult(vals[0])}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Adjust to simulate high-stress market conditions.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleRunSimulation}
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity neon-glow"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                        {loading ? "PROCESSING..." : "RUN SIMULATION"}
                    </Button>
                </GlassCard>

                {/* Results */}
                <div className="lg:col-span-8 space-y-6">
                    <PredictiveChart
                        data={chartData}
                        loading={loading}
                        symbol={symbol}
                    />

                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <GlassCard className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase">Start Price</div>
                                <div className="text-2xl font-mono font-bold">${stats.lastPrice.toFixed(2)}</div>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase">Hist. Volatility</div>
                                <div className="text-2xl font-mono font-bold text-accent">{(stats.volatility * 100).toFixed(2)}%</div>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase">Optimistic (95%)</div>
                                <div className="text-2xl font-mono font-bold text-green-400">
                                    ${chartData[chartData.length - 1]?.p95.toFixed(0)}
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase">Pessimistic (5%)</div>
                                <div className="text-2xl font-mono font-bold text-red-500">
                                    ${chartData[chartData.length - 1]?.p05.toFixed(0)}
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

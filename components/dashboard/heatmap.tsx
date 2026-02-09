"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { MarketData } from "@/lib/api/market"
import { StockDetailDialog } from "./stock-detail-dialog"

interface MarketHeatmapProps {
    stocks: MarketData[]
}

export function MarketHeatmap({ stocks }: MarketHeatmapProps) {
    const [selectedStock, setSelectedStock] = useState<MarketData | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const totalMarketCap = stocks.reduce((acc, stock) => acc + (stock.marketCap || 0), 0)

    const handleStockClick = (stock: MarketData) => {
        setSelectedStock(stock)
        setIsDialogOpen(true)
    }

    return (
        <>
            <GlassCard className="p-6">
                <h3 className="font-heading text-xl font-bold mb-4">Market Heatmap</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 h-[500px]">
                    {stocks.map((stock, i) => {
                        // Mock size variation for visual interest, based on index
                        const spanClass = i === 0 ? "col-span-2 row-span-2" : i === 1 ? "col-span-2 row-span-1" : ""

                        const isPositive = stock.regularMarketChange >= 0
                        const changePercent = stock.regularMarketChangePercent
                        const intensity = Math.min(Math.abs(changePercent) / 3, 1) // Cap intensity at 3% change

                        return (
                            <div
                                key={stock.symbol}
                                onClick={() => handleStockClick(stock)}
                                className={cn(
                                    "rounded-lg p-4 flex flex-col justify-center items-center text-center transition-all hover:scale-[1.02] cursor-pointer border border-white/5",
                                    "relative overflow-hidden group",
                                    spanClass
                                )}
                                style={{
                                    backgroundColor: isPositive
                                        ? `rgba(34, 197, 94, ${0.1 + intensity * 0.5})`
                                        : `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`
                                }}
                            >
                                <div className="z-10 relative">
                                    <span className="font-bold text-xl drop-shadow-sm block">{stock.symbol}</span>
                                    <span className={cn("text-sm font-bold font-mono", isPositive ? "text-green-100" : "text-red-100")}>
                                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                                    </span>
                                    <div className="mt-1 text-xs font-medium opacity-80">
                                        {((stock.marketCap || 0) / totalMarketCap * 100).toFixed(2)}%
                                    </div>
                                    <span className="text-xs text-white/70 mt-1 block opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                        View Cortex Analysis
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </GlassCard>

            <StockDetailDialog
                stock={selectedStock}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </>
    )
}

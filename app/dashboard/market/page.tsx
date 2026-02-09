import { MarketHeatmap } from "@/components/dashboard/heatmap"
import { getQuotes } from "@/lib/api/market"

// Revalidate every minute
export const revalidate = 60;

export default async function MarketPage() {
    const techStocks = ["MSFT", "GOOGL", "AMZN", "META", "TSLA", "AMD", "INTC", "NVDA", "AAPL", "NFLX"]
    const financeStocks = ["JPM", "BAC", "WFC", "C", "GS", "MS"]
    const heatmapData = await getQuotes([...techStocks, ...financeStocks])

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-heading text-primary">Market Analysis</h1>
            <p className="text-muted-foreground">Real-time performance of key market sectors.</p>
            <MarketHeatmap stocks={heatmapData} />
        </div>
    )
}

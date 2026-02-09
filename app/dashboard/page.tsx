import { MarketOverview } from "@/components/dashboard/market-overview"
import { Watchlist } from "@/components/dashboard/watchlist"
import { StockChart } from "@/components/dashboard/stock-chart"
import { StockInfoConsole } from "@/components/dashboard/stock-info-console"
import { getQuotes } from "@/lib/api/market"
import { getWatchlistSymbols } from "@/app/actions"

// Revalidate data every 60 seconds
export const revalidate = 60;

export default async function DashboardPage() {
    // Fetch watchlist symbols from cookie
    const watchlistSymbols = await getWatchlistSymbols()

    // Fetch real data
    const indicesData = await getQuotes(["^TA125.TA", "^GSPC", "^IXIC", "^GDAXI"])
    const watchlistData = await getQuotes(watchlistSymbols)
    const heatmapData = await getQuotes(["MSFT", "GOOGL", "AMZN", "META", "TSLA", "AMD", "INTC", "NVDA", "AAPL", "NFLX"])

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-heading drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                        Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Global market intelligence at regular intervals.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Date/Time or Global Actions could go here */}
                </div>
            </div>

            <MarketOverview indices={indicesData} />

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <StockChart />
                    <StockInfoConsole watchlistData={watchlistData} />
                </div>
                <div className="lg:col-span-3">
                    <Watchlist stocks={watchlistData} />
                </div>
            </div>
        </div>
    )
}

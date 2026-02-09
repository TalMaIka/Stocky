import { INDEX_COMPONENTS, INDEX_NAMES } from "@/lib/indices"
import { getQuotes } from "@/lib/api/market"
import { GlassCard } from "@/components/ui/glass-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketHeatmap } from "@/components/dashboard/heatmap"

// Revalidate every 60 seconds
export const revalidate = 60

export default async function IndexDetailsPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;
    // Decode the symbol (it might be URI encoded, e.g., %5ETA125.TA)
    const rawSymbol = decodeURIComponent(symbol)

    // Handle potential double encoding or mismatch if basic decode isn't enough
    // But typically next.js handles params decoding. 
    // Let's ensure we use the right key. 
    // Note: URL encoding of '^' is '%5E'. 

    const indexName = INDEX_NAMES[rawSymbol] || rawSymbol
    const components = INDEX_COMPONENTS[rawSymbol] || []

    if (components.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Index Not Found</h1>
                <p className="text-muted-foreground">
                    Detailed component data is not available for {rawSymbol}.
                </p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        )
    }

    // Fetch data
    const indexData = await getQuotes([rawSymbol])
    const stockData = await getQuotes(components)

    // Calculate total market cap of the constituents to determine relative weight
    const totalMarketCap = stockData.reduce((acc, stock) => acc + (stock.marketCap || 0), 0)

    // Sort by "Impact" - approximated by absolute % change for now, 
    // ideally it would be (Change% * MarketCap) but Market Cap weighting is complex without full data.
    // Let's sort by Change % Descending to show "Movers"
    const sortedStocks = [...stockData].sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent)

    const indexInfo = indexData[0] || { regularMarketPrice: 0, regularMarketChangePercent: 0, regularMarketChange: 0 }
    const isPositive = indexInfo.regularMarketChange >= 0

    return (
        <div className="flex flex-col gap-6 h-full pb-8">
            {/* Header */}
            <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-heading text-primary">{indexName}</h1>
                        <p className="text-muted-foreground font-mono mt-1 text-lg">
                            {rawSymbol}
                        </p>
                    </div>
                    <div className={cn(
                        "text-right px-4 py-2 rounded-xl border backdrop-blur-md",
                        isPositive ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        <div className="text-3xl font-bold font-mono tracking-tight">
                            {indexInfo.regularMarketPrice.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-sm font-medium">
                            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            <span>{Math.abs(indexInfo.regularMarketChange).toFixed(2)}</span>
                            <span>({Math.abs(indexInfo.regularMarketChangePercent).toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap of these specific components */}
            <GlassCard className="p-1">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-heading font-bold text-lg">Sector Heatmap</h3>
                </div>
                <MarketHeatmap stocks={stockData.slice(0, 16)} />
            </GlassCard>

            {/* Movers Table */}
            <GlassCard className="overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-heading font-bold text-xl">Constituent Performance</h3>
                    <p className="text-xs text-muted-foreground">
                        Top weighted components driving the index today.
                    </p>
                </div>
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-[100px] text-muted-foreground">Symbol</TableHead>
                            <TableHead className="text-muted-foreground">Name</TableHead>
                            <TableHead className="text-right text-muted-foreground">Weight</TableHead>
                            <TableHead className="text-right text-muted-foreground">Price</TableHead>
                            <TableHead className="text-right text-muted-foreground">Change (%)</TableHead>
                            <TableHead className="text-right text-muted-foreground">Vol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStocks.map((stock) => {
                            const isStockPos = stock.regularMarketChange >= 0
                            const weight = totalMarketCap > 0 ? ((stock.marketCap || 0) / totalMarketCap) * 100 : 0

                            return (
                                <TableRow key={stock.symbol} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium font-mono text-primary">{stock.symbol}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[200px]" title={stock.shortName}>{stock.shortName}</TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">{weight.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right font-mono text-foreground">${stock.regularMarketPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className={cn("inline-flex items-center gap-1 font-medium min-w-[80px] justify-end", isStockPos ? "text-green-400" : "text-red-400")}>
                                            {isStockPos ? "+" : ""}{stock.regularMarketChangePercent.toFixed(2)}%
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground text-xs">{((stock.regularMarketVolume || 0) / 1e6).toFixed(1)}M</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </GlassCard>
        </div>
    )
}

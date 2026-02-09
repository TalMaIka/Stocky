import { getHistoricalData } from "@/lib/api/market"
import { NextRequest, NextResponse } from "next/server"
import yahooFinance from 'yahoo-finance2'

const yf = (yahooFinance as any).default || yahooFinance
const instance = new yf()

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')

    if (!q) {
        return NextResponse.json({ quotes: [] })
    }

    try {
        const results = await instance.search(q, {
            newsCount: 0,
            quotesCount: 10
        })

        // Filter for equities and ETFs to keep it relevant
        const filteredQuotes = results.quotes.filter((quote: any) =>
            quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF'
        ).map((quote: any) => ({
            symbol: quote.symbol,
            shortname: quote.shortname || quote.longname,
            exchDisp: quote.exchDisp,
            typeDisp: quote.typeDisp
        }))

        return NextResponse.json({ quotes: filteredQuotes })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ quotes: [] }, { status: 500 })
    }
}

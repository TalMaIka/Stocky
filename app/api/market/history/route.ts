import { getHistoricalData } from "@/lib/api/market"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    const range = searchParams.get('range') || '1M'

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    let period1 = new Date()
    const period2 = new Date()

    switch (range) {
        case '1D':
            period1.setDate(period1.getDate() - 1)
            break
        case '1W':
            period1.setDate(period1.getDate() - 7)
            break
        case '1M':
            period1.setMonth(period1.getMonth() - 1)
            break
        case '3M':
            period1.setMonth(period1.getMonth() - 3)
            break
        case '1Y':
            period1.setFullYear(period1.getFullYear() - 1)
            break
        case 'ALL':
            period1.setFullYear(period1.getFullYear() - 5) // Cap at 5 years for now
            break
        default:
            period1.setMonth(period1.getMonth() - 1)
    }

    const data = await getHistoricalData(symbol, period1, period2)
    return NextResponse.json(data)
}

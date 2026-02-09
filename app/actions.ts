'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const WATCHLIST_COOKIE = 'stocky_watchlist'
const DEFAULT_WATCHLIST = ["NICE", "TEVA", "WIX", "CHKP", "AAPL", "NVDA"]

export async function getWatchlistSymbols(): Promise<string[]> {
    const cookieStore = await cookies()
    const val = cookieStore.get(WATCHLIST_COOKIE)?.value

    if (!val) return DEFAULT_WATCHLIST

    try {
        return JSON.parse(val)
    } catch {
        return DEFAULT_WATCHLIST
    }
}

export async function addToWatchlist(symbol: string) {
    const symbols = await getWatchlistSymbols()
    const upperSymbol = symbol.toUpperCase()

    if (!symbols.includes(upperSymbol)) {
        const newList = [...symbols, upperSymbol]
        const cookieStore = await cookies()
        cookieStore.set(WATCHLIST_COOKIE, JSON.stringify(newList))
        revalidatePath('/dashboard')
    }
}

export async function removeFromWatchlist(symbol: string) {
    const symbols = await getWatchlistSymbols()
    const upper = symbol.toUpperCase()
    const newList = symbols.filter(s => s !== upper)

    const cookieStore = await cookies()
    cookieStore.set(WATCHLIST_COOKIE, JSON.stringify(newList))
    revalidatePath('/dashboard')
}

import yahooFinance from 'yahoo-finance2';

// In Next.js with certain configurations, the default export might be wrapped.
// We'll inspect what we got.
const yf = (yahooFinance as any).default || yahooFinance;

// If it's the class (v3 beta behavior often), instantiate it.
// If it's already an instance (v2 behavior), use it directly but suppress notices.
const instance = new yf();

try {
    if (instance.suppressNotices) {
        instance.suppressNotices(['yahooSurvey']);
    }
} catch (e) {
    console.warn("Failed to suppress notices on yahooFinance instance", e);
}

export interface MarketData {
    symbol: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    shortName?: string;
    marketCap?: number;
    regularMarketVolume?: number;
    regularMarketDayLow?: number;
    regularMarketDayHigh?: number;
    fiftyTwoWeekLow?: number;
    fiftyTwoWeekHigh?: number;
    trailingPE?: number;
    dividendYield?: number;
    sector?: string;
    averageDailyVolume3Month?: number;
    regularMarketPreviousClose?: number;
}

export interface HistoricalDataPoint {
    date: string; // ISO date string
    open: number;
    close: number;
}

export async function getQuotes(symbols: string[]): Promise<MarketData[]> {
    try {
        const results = await instance.quote(symbols) as any;
        // yahooFinance.quote returns a single object if one symbol, or array if multiple.
        // We want to ensure we always work with an array.
        const quotes = Array.isArray(results) ? results : [results];

        // Parallel fetch for sector/profile info
        const profiles = await Promise.all(
            quotes.map(async (q: any) => {
                try {
                    const summary = await instance.quoteSummary(q.symbol, { modules: ['assetProfile'] });
                    return summary?.assetProfile;
                } catch (e) {
                    return null;
                }
            })
        );

        return quotes.map((q: any, i: number) => {
            const p = profiles[i];
            return {
                symbol: q.symbol,
                regularMarketPrice: q.regularMarketPrice || 0,
                regularMarketChange: q.regularMarketChange || 0,
                regularMarketChangePercent: q.regularMarketChangePercent || 0,
                shortName: q.shortName,
                marketCap: q.marketCap,
                regularMarketVolume: q.regularMarketVolume,
                regularMarketDayLow: q.regularMarketDayLow,
                regularMarketDayHigh: q.regularMarketDayHigh,
                fiftyTwoWeekLow: q.fiftyTwoWeekLow,
                fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
                trailingPE: q.trailingPE,
                dividendYield: q.dividendYield,
                sector: p?.sector || q.categoryName || "-",
                averageDailyVolume3Month: q.averageDailyVolume3Month,
                regularMarketPreviousClose: q.regularMarketPreviousClose,
            };
        });
    } catch (error) {
        console.error("Failed to fetch quotes for", symbols, error);
        return [];
    }
}

export async function getHistoricalData(symbol: string, period1: Date, period2: Date = new Date()): Promise<HistoricalDataPoint[]> {
    try {
        const result = await instance.historical(symbol, {
            period1,
            period2,
            interval: '1d' // daily interval for now
        }) as any[];

        return result
            .map((quote: any) => ({
                date: quote.date.toISOString(),
                open: quote.open,
                close: quote.close
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
        console.error(`Failed to fetch history for ${symbol}:`, error);
        return [];
    }
}

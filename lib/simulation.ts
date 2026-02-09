/**
 * Monte Carlo Simulation Engine for Stock Price Prediction
 * Uses Geometric Brownian Motion (GBM) model
 */

interface SimulationResult {
    percentiles: {
        p05: number[]
        p25: number[]
        p50: number[]
        p75: number[]
        p95: number[]
    }
    paths: number[][] // A subset of raw paths for visualization
}

/**
 * Calculates the annualized volatility (standard deviation of log returns)
 * from a series of historical prices.
 */
export function calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const logReturns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        const current = prices[i];
        const prev = prices[i - 1];
        if (prev > 0) {
            logReturns.push(Math.log(current / prev));
        }
    }

    const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
    const variance = logReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (logReturns.length - 1);

    // Annualize the daily volatility
    // Standard deviation * sqrt(252 trading days)
    return Math.sqrt(variance) * Math.sqrt(252);
}

/**
 * Runs a Monte Carlo simulation using Geometric Brownian Motion.
 * 
 * @param startPrice Current stock price
 * @param volatility Annualized volatility
 * @param days Number of days top project into the future
 * @param numSimulations Number of paths to simulate (default 1000)
 * @param drift Annualized expected return (default 0.1 for 10% growth)
 */
export function runMonteCarlo(
    startPrice: number,
    volatility: number,
    days: number,
    numSimulations: number = 1000,
    drift: number = 0.1
): SimulationResult {
    const dt = 1 / 252; // Time step (1 day)
    const paths: number[][] = [];

    // Generate paths
    for (let i = 0; i < numSimulations; i++) {
        const path: number[] = [startPrice];
        let currentPrice = startPrice;

        for (let t = 0; t < days; t++) {
            // GBM Formula: S(t+dt) = S(t) * exp( (mu - sigma^2/2)*dt + sigma*sqrt(dt)*Z )
            // Z is standard normal random variable
            const Z = boxMullerTransform();
            const driftTerm = (drift - 0.5 * volatility * volatility) * dt;
            const shockTerm = volatility * Math.sqrt(dt) * Z;

            currentPrice = currentPrice * Math.exp(driftTerm + shockTerm);
            path.push(currentPrice);
        }
        paths.push(path);
    }

    // Calculate percentiles for each day
    const percentiles = {
        p05: [] as number[],
        p25: [] as number[],
        p50: [] as number[],
        p75: [] as number[],
        p95: [] as number[]
    };

    for (let t = 0; t <= days; t++) {
        const pricesAtT = paths.map(p => p[t]).sort((a, b) => a - b);
        percentiles.p05.push(getPercentile(pricesAtT, 0.05));
        percentiles.p25.push(getPercentile(pricesAtT, 0.25));
        percentiles.p50.push(getPercentile(pricesAtT, 0.50));
        percentiles.p75.push(getPercentile(pricesAtT, 0.75));
        percentiles.p95.push(getPercentile(pricesAtT, 0.95));
    }

    return {
        percentiles,
        // Return first 5 paths as examples if needed, or empty to save bandwidth
        paths: paths.slice(0, 5)
    };
}

// Random Number Generator for Standard Normal Distribution
function boxMullerTransform(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function getPercentile(sortedData: number[], percentile: number): number {
    const index = Math.floor(percentile * sortedData.length);
    return sortedData[Math.min(index, sortedData.length - 1)];
}

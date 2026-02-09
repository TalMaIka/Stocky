export const INDEX_COMPONENTS: Record<string, string[]> = {
    // TA-125 (Tel Aviv) - Top weights
    "^TA125.TA": [
        "NICE.TA", "TEVA.TA", "LUMI.TA", "POLI.TA", "DSCT.TA",
        "TLSE.TA", "ICL.TA", "BEZQ.TA", "ELBIT.TA", "MTRS.TA",
        "ENOG.TA", "FIBI.TA", "PHOE.TA", "HREL.TA", "CLIS.TA",
        "ESLT.TA", "BIG.TA", "AMOT.TA", "AZRG.TA", "SPEN.TA"
    ],
    // S&P 500 - Top weights
    "^GSPC": [
        "MSFT", "AAPL", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "TSLA", "LLY", "AVGO",
        "JPM", "XOM", "UNH", "V", "PG", "MA", "COST", "JNJ", "HD", "MRK"
    ],
    // Nasdaq 100 - Top weights
    "^IXIC": [
        "MSFT", "AAPL", "NVDA", "AMZN", "AVGO", "META", "TSLA", "GOOGL", "COST", "NFLX",
        "AMD", "ADBE", "PEP", "LIN", "CSCO", "TMUS", "INTC", "QCOM", "TXN", "AMAT"
    ],
    // DAX (Germany)
    "^GDAXI": [
        "SAP.DE", "SIE.DE", "ALV.DE", "DTE.DE", "AIR.DE", "BMW.DE", "MBG.DE", "VOW3.DE", "BAS.DE", "MUV2.DE",
        "IFX.DE", "DHL.DE", "DB1.DE", "BEI.DE", "ADS.DE", "EOAN.DE", "RWE.DE", "BAYN.DE", "HEN3.DE", "VNA.DE"
    ]
}

export const INDEX_NAMES: Record<string, string> = {
    "^TA125.TA": "Tel Aviv 125",
    "^GSPC": "S&P 500",
    "^IXIC": "Nasdaq Composite",
    "^GDAXI": "DAX Performance Index"
}

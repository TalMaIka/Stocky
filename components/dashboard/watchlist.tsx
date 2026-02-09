"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUp, ArrowDown, Plus, Trash2, Search, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketData } from "@/lib/api/market"
import { useState, useTransition, useMemo, useEffect } from "react"
import { addToWatchlist, removeFromWatchlist } from "@/app/actions"
import { useRouter, useSearchParams } from "next/navigation"

interface WatchlistProps {
    stocks: MarketData[]
}

export function Watchlist({ stocks }: WatchlistProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [newSymbol, setNewSymbol] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Debounced search logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true)
                try {
                    const res = await fetch(`/api/market/search?q=${searchQuery}`)
                    const json = await res.json()
                    setSearchResults(json.quotes || [])
                } catch (error) {
                    console.error("Search failed:", error)
                    setSearchResults([])
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
            }
        }, 400)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const [sortConfig, setSortConfig] = useState<{ key: keyof MarketData, direction: 'asc' | 'desc' }>({
        key: 'regularMarketChangePercent',
        direction: 'desc'
    })

    const activeSymbol = searchParams.get('chartSymbol') || (stocks.length > 0 ? stocks[0].symbol : "NVDA")

    const sortedStocks = useMemo(() => {
        const sortable = [...stocks]
        sortable.sort((a, b) => {
            const aValue = a[sortConfig.key] ?? 0
            const bValue = b[sortConfig.key] ?? 0

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
        return sortable
    }, [stocks, sortConfig])

    const requestSort = (key: keyof MarketData) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const SortIcon = ({ column }: { column: keyof MarketData }) => {
        if (sortConfig.key !== column) return <MoreHorizontal className="w-3 h-3 opacity-20 ml-1 inline-block" />
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary" />
            : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary" />
    }

    const handleAddStock = (symbol: string) => {
        startTransition(async () => {
            await addToWatchlist(symbol);
            setSearchQuery("");
            setSearchResults([]);
        })
    }

    const handleRemoveStock = (symbol: string) => {
        startTransition(async () => {
            await removeFromWatchlist(symbol);
        })
    }

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <h3 className="font-heading text-xl font-bold">My Watchlist</h3>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] gap-2 font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10 hover:text-primary transition-all duration-150">
                            <Plus className="w-3 h-3" /> Manage Terminal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-[#050507]/95 border-white/5 backdrop-blur-3xl text-foreground p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                        <div className="flex flex-col h-[600px]">
                            {/* Terminal Header */}
                            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                <DialogTitle className="text-xl font-black tracking-tighter flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    WATCHLIST COMMAND CONSOLE
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                                    Symbol Discovery & Persistent Sync Engine
                                </DialogDescription>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
                                {/* Search Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                                        <Search className="w-3 h-3" /> Search Markets
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            placeholder="Enter Symbol or Company Name..."
                                            className="h-12 bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 transition-all pl-12 text-sm font-medium tracking-wide placeholder:text-muted-foreground/30"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                        {searchResults.map((result) => {
                                            const isAlreadyWatched = stocks.some(s => s.symbol === result.symbol)
                                            return (
                                                <button
                                                    key={result.symbol}
                                                    onClick={() => !isAlreadyWatched && handleAddStock(result.symbol)}
                                                    disabled={isPending || isAlreadyWatched}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left group/btn",
                                                        isAlreadyWatched
                                                            ? "bg-emerald-500/5 border-emerald-500/20 cursor-default"
                                                            : "bg-white/[0.03] border-white/5 hover:bg-primary/10 hover:border-primary/30"
                                                    )}
                                                >
                                                    <div className="min-w-0 pr-2">
                                                        <div className={cn(
                                                            "font-black font-mono text-xs transition-colors",
                                                            isAlreadyWatched ? "text-emerald-400" : "text-white group-hover/btn:text-primary"
                                                        )}>
                                                            {result.symbol}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground truncate group-hover/btn:text-white/70">{result.shortname}</div>
                                                    </div>
                                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                                        <div className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30">{result.exchDisp}</div>
                                                        {isPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                                        ) : isAlreadyWatched ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-tighter">Watched</span>
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                            </div>
                                                        ) : (
                                                            <Plus className="w-3 h-3 text-primary opacity-0 group-hover/btn:opacity-100 transform scale-75 group-hover/btn:scale-100 transition-all" />
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                        {searchQuery.length > 1 && !isSearching && searchResults.length === 0 && (
                                            <div className="col-span-2 py-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">No matching assets found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                {/* Current List Section */}
                                <div className="flex-1 overflow-hidden flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                                            <div className="w-2 h-px bg-current" /> Persistent Queue
                                        </div>
                                        <div className="text-[9px] font-black text-muted-foreground/30">{stocks.length} ASSETS TOTAL</div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                        {stocks.map(stock => (
                                            <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="px-2 py-1 bg-white/5 rounded-md font-black font-mono text-[10px] text-primary">{stock.symbol}</div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white/90">{stock.shortName}</div>
                                                        <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-black">${stock.regularMarketPrice?.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/item:opacity-100 transition-all"
                                                    onClick={() => handleRemoveStock(stock.symbol)}
                                                    disabled={isPending}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                        {stocks.length === 0 && (
                                            <div className="py-12 text-center opacity-40 italic text-sm">Watchlist is currently empty</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer/Close */}
                            <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="h-9 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                                        Exit Terminal
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
            <div className="overflow-auto flex-1">
                <Table>
                    <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead
                                className="text-muted-foreground w-[100px] cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('symbol')}
                            >
                                Symbol <SortIcon column="symbol" />
                            </TableHead>
                            <TableHead
                                className="text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('shortName')}
                            >
                                Name <SortIcon column="shortName" />
                            </TableHead>
                            <TableHead
                                className="text-right text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('regularMarketPrice')}
                            >
                                Price <SortIcon column="regularMarketPrice" />
                            </TableHead>
                            <TableHead
                                className="text-right text-muted-foreground cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('regularMarketChangePercent')}
                            >
                                Change <SortIcon column="regularMarketChangePercent" />
                            </TableHead>
                            <TableHead
                                className="text-right text-muted-foreground hidden md:table-cell cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('regularMarketVolume')}
                            >
                                Volume <SortIcon column="regularMarketVolume" />
                            </TableHead>
                            <TableHead
                                className="text-right text-muted-foreground hidden lg:table-cell cursor-pointer hover:text-primary transition-colors select-none"
                                onClick={() => requestSort('marketCap')}
                            >
                                Mkt Cap <SortIcon column="marketCap" />
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStocks.map((stock) => {
                            const isPositive = stock.regularMarketChange >= 0
                            const isActive = stock.symbol === activeSymbol
                            return (
                                <TableRow
                                    key={stock.symbol}
                                    className={cn(
                                        "border-white/5 hover:bg-white/5 transition-all cursor-pointer group/row",
                                        isActive && "bg-primary/10 border-l-2 border-l-primary"
                                    )}
                                    onClick={() => router.push(`?chartSymbol=${stock.symbol}`, { scroll: false })}
                                >
                                    <TableCell className={cn(
                                        "font-medium font-heading tracking-wide",
                                        isActive ? "text-primary brightness-125" : "text-primary"
                                    )}>
                                        {stock.symbol}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[150px]">{stock.shortName}</TableCell>
                                    <TableCell className="text-right font-mono">${stock.regularMarketPrice?.toFixed(2) || '0.00'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className={cn("flex items-center justify-end gap-1 font-medium", isPositive ? "text-green-400" : "text-red-400")}>
                                            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                            {Math.abs(stock.regularMarketChangePercent || 0).toFixed(2)}%
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right hidden md:table-cell text-muted-foreground font-mono text-xs">
                                        {(stock.regularMarketVolume || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right hidden lg:table-cell text-muted-foreground font-mono text-xs">
                                        {stock.marketCap ? (stock.marketCap / 1e9).toFixed(2) + 'B' : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl text-foreground">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="focus:bg-primary/20 focus:text-primary"
                                                    onClick={() => router.push(`?chartSymbol=${stock.symbol}`)}
                                                >
                                                    View Chart
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary">Set Alert</DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem
                                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                                    onClick={() => handleRemoveStock(stock.symbol)}
                                                >
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

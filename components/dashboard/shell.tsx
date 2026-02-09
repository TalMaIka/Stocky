"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LineChart, PieChart, Settings, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LineChart, label: "Market", href: "/dashboard/market" },
    { icon: Wallet, label: "Portfolio", href: "/dashboard/portfolio" },
    { icon: PieChart, label: "Analysis", href: "/dashboard/analysis" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <span className="font-heading text-2xl font-bold tracking-wider text-primary">
                        STOCKY
                    </span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3",
                                        isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_-3px_var(--primary)]" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-base">{item.label}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    )
}

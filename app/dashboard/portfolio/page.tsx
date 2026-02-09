import { GlassCard } from "@/components/ui/glass-card"

export default function PortfolioPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-heading text-primary">My Portfolio</h1>
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Portfolio Tracking Coming Soon</h2>
                <p className="text-muted-foreground max-w-md">
                    Connect your brokerage accounts to track your assets across different platforms in real-time.
                </p>
            </GlassCard>
        </div>
    )
}

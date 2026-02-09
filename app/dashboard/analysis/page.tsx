import { GlassCard } from "@/components/ui/glass-card"

export default function AnalysisPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-heading text-primary">Deep Analysis</h1>
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Advanced Analytics Module</h2>
                <p className="text-muted-foreground max-w-md">
                    Institutional-grade technical indicators and fundamental analysis tools are currently under development.
                </p>
            </GlassCard>
        </div>
    )
}

import Link from "next/link"
import { NeonButton } from "@/components/ui/neon-button"
import { GlassCard } from "@/components/ui/glass-card"
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <span className="font-heading text-2xl font-bold tracking-wider text-primary drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">STOCKY</span>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground items-center">
          <Link href="#" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-primary transition-colors">About</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <NeonButton size="sm" glowColor="accent">Launch Console</NeonButton>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden flex flex-col items-center text-center px-4">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            v2.0 Live: AI-Powered Insights
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold font-heading tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent max-w-4xl drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
            Markets, <span className="text-primary drop-shadow-[0_0_30px_rgba(0,243,255,0.4)]">Decoded.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-backwards">
            Experience the next generation of market intelligence. Real-time data, AI analysis, and institutional-grade visualization in one futuristic dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-backwards">
            <Link href="/dashboard">
              <NeonButton size="lg" className="w-full sm:w-auto h-12 px-8 text-lg" glowColor="primary">
                Start Interactive Demo <ArrowRight className="ml-2 w-5 h-5" />
              </NeonButton>
            </Link>
            <NeonButton size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg">
              View Documentation
            </NeonButton>
          </div>

          {/* Dashboard Preview / Tilt Effect */}
          <div className="mt-20 w-full max-w-6xl px-4 perspective-[2000px] group">
            <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl transition-all duration-1000 ease-out transform group-hover:rotate-x-0 group-hover:scale-105" style={{ transform: "rotateX(20deg) scale(0.9)" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

              {/* Mock Dashboard Representation */}
              <div className="rounded-lg bg-background/50 w-full aspect-[16/9] flex items-center justify-center border border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                <div className="text-center z-20">
                  <span className="text-4xl font-bold text-white/10 font-heading">DASHBOARD PREVIEW</span>
                </div>
                {/* Glowing dots or lines */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-black/20 border-t border-white/5">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <GlassCard className="p-8 group hover:-translate-y-2 transition-transform duration-300" gradient>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-3">Real-time Velocity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Zero-latency data streaming with simplified WebSocket connections. Feel the market pulse as it happens.
              </p>
            </GlassCard>
            <GlassCard className="p-8 group hover:-translate-y-2 transition-transform duration-300 delay-100" gradient>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors border border-secondary/20">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-3">Institutional Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced charting, heatmap visualizations, and technical indicators previously reserved for hedge funds.
              </p>
            </GlassCard>
            <GlassCard className="p-8 group hover:-translate-y-2 transition-transform duration-300 delay-200" gradient>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors border border-accent/20">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-3">AI Sentinel</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Cortex v4.0 AI monitors 50,000+ tickers 24/7 to detect anomalies, trend reversals, and sentiment shifts.
              </p>
            </GlassCard>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Stocky Inc. Markets, Decoded.</p>
      </footer>
    </div>
  )
}

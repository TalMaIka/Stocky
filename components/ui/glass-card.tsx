import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    gradient?: boolean
}

export function GlassCard({ className, gradient, children, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/20",
                gradient && "bg-gradient-to-br from-white/5 to-transparent",
                className
            )}
            {...props}
        >
            {gradient && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            )}
            {children}
        </div>
    )
}

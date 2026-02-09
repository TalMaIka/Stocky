import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends ButtonProps {
    glowColor?: "primary" | "secondary" | "accent"
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, variant = "default", glowColor = "primary", ...props }, ref) => {

        const glowMap = {
            primary: "shadow-[0_0_20px_-5px_var(--primary)] hover:shadow-[0_0_30px_-5px_var(--primary)]",
            secondary: "shadow-[0_0_20px_-5px_var(--secondary)] hover:shadow-[0_0_30px_-5px_var(--secondary)]",
            accent: "shadow-[0_0_20px_-5px_var(--accent)] hover:shadow-[0_0_30px_-5px_var(--accent)]",
        }

        return (
            <Button
                ref={ref}
                className={cn(
                    "relative transition-all duration-300 border-transparent",
                    variant === "default" && glowMap[glowColor],
                    variant === "outline" && "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:text-primary-foreground hover:shadow-[0_0_15px_-5px_var(--primary)]",
                    variant === "ghost" && "hover:bg-primary/5 hover:text-primary",
                    className
                )}
                variant={variant}
                {...props}
            />
        )
    }
)
NeonButton.displayName = "NeonButton"

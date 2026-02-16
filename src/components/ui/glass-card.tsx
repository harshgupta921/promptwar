import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "neon" | "danger";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl border p-6 transition-all duration-300",
                    "glass-panel shadow-lg backdrop-blur-md",
                    variant === "default" && "border-white/10 hover:border-white/20",
                    variant === "neon" && "border-primary/50 shadow-primary/20 hover:shadow-primary/40 hover:border-primary",
                    variant === "danger" && "border-destructive/50 shadow-destructive/20 hover:shadow-destructive/40 hover:border-destructive",
                    className
                )}
                {...props}
            />
        );
    }
);
GlassCard.displayName = "GlassCard";

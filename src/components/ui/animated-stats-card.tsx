"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedStatsCardProps {
  children: ReactNode;
  variant?: "primary" | "accent";
  className?: string;
}

export const AnimatedStatsCard = ({
  children,
  variant = "primary",
  className,
}: AnimatedStatsCardProps) => {
  const isPrimary = variant === "primary";

  return (
    <div className={cn("relative group", className)}>
      {/* Animated gradient border */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500",
          "bg-[length:200%_200%] animate-border-flow",
          isPrimary
            ? "bg-gradient-to-r from-primary/20 via-primary to-primary/20"
            : "bg-gradient-to-r from-accent/20 via-accent to-accent/20"
        )}
      />

      {/* Corner pulse effects */}
      <div
        className={cn(
          "absolute -top-1 -left-1 w-2 h-2 rounded-full animate-corner-pulse",
          isPrimary ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
        )}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={cn(
          "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-corner-pulse",
          isPrimary ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
        )}
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-2 h-2 rounded-full animate-corner-pulse",
          isPrimary ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
        )}
        style={{ animationDelay: "1s" }}
      />
      <div
        className={cn(
          "absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-corner-pulse",
          isPrimary ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
        )}
        style={{ animationDelay: "1.5s" }}
      />

      {/* Inner card with shine effect */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl p-2 text-center transition-all duration-300",
          "backdrop-blur-sm",
          isPrimary
            ? "bg-gradient-to-br from-primary/5 to-primary/15"
            : "bg-gradient-to-br from-accent/5 to-accent/15"
        )}
      >
        {/* Shine overlay */}
        <div
          className={cn(
            "absolute inset-0 w-1/3 -skew-x-12 animate-shine pointer-events-none",
            "bg-gradient-to-r from-transparent via-white/30 to-transparent"
          )}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

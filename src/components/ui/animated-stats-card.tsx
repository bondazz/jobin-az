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
      {/* Base border glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl",
          isPrimary
            ? "bg-gradient-to-br from-primary/10 to-primary/5"
            : "bg-gradient-to-br from-accent/10 to-accent/5"
        )}
      />

      {/* Animated flowing light border */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* The flowing light beam with gradient tail */}
        <div
          className={cn(
            "absolute w-[80px] h-[80px] rounded-xl",
            isPrimary
              ? "[background:conic-gradient(from_0deg,transparent_0deg,transparent_60deg,hsl(var(--primary))_120deg,hsl(var(--primary)/0.8)_150deg,hsl(var(--primary)/0.4)_180deg,hsl(var(--primary)/0.1)_210deg,transparent_270deg,transparent_360deg)]"
              : "[background:conic-gradient(from_0deg,transparent_0deg,transparent_60deg,hsl(var(--accent))_120deg,hsl(var(--accent)/0.8)_150deg,hsl(var(--accent)/0.4)_180deg,hsl(var(--accent)/0.1)_210deg,transparent_270deg,transparent_360deg)]"
          )}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "border-rotate 4s linear infinite",
            width: "150%",
            height: "150%",
          }}
        />
      </div>

      {/* Inner mask to create border effect */}
      <div
        className={cn(
          "absolute inset-[2px] rounded-[10px] z-10",
          "bg-gradient-to-br",
          isPrimary
            ? "from-background via-background to-primary/5"
            : "from-background via-background to-accent/5"
        )}
      />

      {/* Content container */}
      <div className="relative z-20 p-2.5 text-center">
        {children}
      </div>

      <style jsx>{`
        @keyframes border-rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

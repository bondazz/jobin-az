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
      {/* Outer glow effect */}
      <div
        className={cn(
          "absolute -inset-1 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500",
          isPrimary
            ? "bg-gradient-to-r from-primary/50 via-primary to-primary/50"
            : "bg-gradient-to-r from-accent/50 via-accent to-accent/50"
        )}
        style={{
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />

      {/* Animated flowing light border */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div
          className={cn(
            "absolute",
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

      {/* Premium inner glass effect */}
      <div
        className={cn(
          "absolute inset-[2px] rounded-[10px] z-10 overflow-hidden",
          "backdrop-blur-xl"
        )}
      >
        {/* Gradient base */}
        <div
          className={cn(
            "absolute inset-0",
            isPrimary
              ? "bg-gradient-to-br from-background via-background/95 to-primary/10"
              : "bg-gradient-to-br from-background via-background/95 to-accent/10"
          )}
        />

        {/* Top highlight reflection */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1/2",
            "bg-gradient-to-b from-white/10 to-transparent"
          )}
        />

        {/* Animated inner light sweep */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
            isPrimary
              ? "bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-accent/10 to-transparent"
          )}
          style={{
            animation: "light-sweep 2s ease-in-out infinite",
          }}
        />

        {/* Bottom glow */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-1/3",
            isPrimary
              ? "bg-gradient-to-t from-primary/8 to-transparent"
              : "bg-gradient-to-t from-accent/8 to-transparent"
          )}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

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
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.02);
          }
        }
        @keyframes light-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

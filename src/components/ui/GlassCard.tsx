"use client";

import { cn } from "@/lib/utils";
import { useIsLowEndDevice } from "@/hooks/useIsLowEndDevice";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
    const isLowEnd = useIsLowEndDevice();

    return (
        <div
            className={cn(
                "glass-panel",
                isLowEnd ? "glass-fallback" : "glass-premium",
                className
            )}
        >
            {children}
        </div>
    );
}

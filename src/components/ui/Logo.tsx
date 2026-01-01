"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    variant?: "horizontal" | "icon";
    className?: string;
}

export function Logo({ variant = "horizontal", className }: LogoProps) {
    if (variant === "icon") {
        return (
            <div className={cn("relative w-10 h-10 flex items-center justify-center", className)}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse-slow" />

                {/* SVG Icon: Digital Mind */}
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full relative z-10 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                >
                    <defs>
                        <linearGradient id="brain-gradient" x1="0" y1="0" x2="40" y2="40">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                        <linearGradient id="gold-gradient" x1="0" y1="0" x2="40" y2="40">
                            <stop offset="0%" stopColor="#FCD34D" />
                            <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                    </defs>

                    {/* Brain Networks / Nodes - Circuitry Style */}
                    <path
                        d="M20 8C14 8 9 13 9 19C9 25 13 30 20 32C27 30 31 25 31 19C31 13 26 8 20 8Z"
                        stroke="url(#brain-gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="rgba(37, 99, 235, 0.1)"
                    />

                    {/* Internal Neural Connections */}
                    <path d="M20 12V28" stroke="url(#brain-gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                    <path d="M14 18H26" stroke="url(#brain-gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                    <circle cx="20" cy="20" r="3" fill="#2563EB" className="animate-pulse" />

                    {/* Abstract Academic Cap / Wreath - Golden Accent */}
                    <path
                        d="M12 26C14 29 17 31 20 31C23 31 26 29 28 26"
                        stroke="url(#gold-gradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* Top Spark */}
                    <circle cx="20" cy="6" r="1.5" fill="#FCD34D" className="animate-ping-slow" />
                </svg>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-3 group select-none", className)}>
            <Logo variant="icon" className="w-10 h-10 group-hover:scale-105 transition-transform duration-500" />

            <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-serif font-bold tracking-tight leading-none text-white">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600">B</span>rainy
                </h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium group-hover:text-blue-400/80 transition-colors duration-300">
                    Crafted for Excellence
                </span>
            </div>
        </div>
    );
}

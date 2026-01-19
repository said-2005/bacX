import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "blue" | "green" | "purple" | "orange" | "red";
}

export function StatsCard({ title, value, description, icon: Icon, trend, color = "blue" }: StatsCardProps) {
    const colorStyles = {
        blue: {
            bg: "bg-blue-600/10",
            border: "border-blue-500/20",
            text: "text-blue-500",
            shadow: "shadow-[0_0_15px_rgba(37,99,235,0.1)]",
            iconBg: "bg-blue-500/20"
        },
        green: {
            bg: "bg-green-600/10",
            border: "border-green-500/20",
            text: "text-green-500",
            shadow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
            iconBg: "bg-green-500/20"
        },
        purple: {
            bg: "bg-purple-600/10",
            border: "border-purple-500/20",
            text: "text-purple-500",
            shadow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
            iconBg: "bg-purple-500/20"
        },
        orange: {
            bg: "bg-orange-600/10",
            border: "border-orange-500/20",
            text: "text-orange-500",
            shadow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
            iconBg: "bg-orange-500/20"
        },
        red: {
            bg: "bg-red-600/10",
            border: "border-red-500/20",
            text: "text-red-500",
            shadow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
            iconBg: "bg-red-500/20"
        }
    };

    const style = colorStyles[color];

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
            "bg-black/40 backdrop-blur-xl",
            style.border,
            style.shadow
        )}>
            {/* Background Gradient Blob */}
            <div className={cn(
                "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[50px] opacity-50",
                style.bg
            )} />

            <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-4">
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        style.iconBg
                    )}>
                        <Icon className={cn("w-6 h-6", style.text)} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-zinc-400 font-tajawal">{title}</p>
                        <h3 className="text-3xl font-bold text-white font-mono mt-1">{value}</h3>
                    </div>

                    {description && (
                        <p className="text-xs text-zinc-500 font-tajawal">{description}</p>
                    )}
                </div>

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
                        trend.isPositive
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                            : "text-red-400 border-red-500/20 bg-red-500/10"
                    )}>
                        <span>{trend.isPositive ? "+" : "-"}{trend.value}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

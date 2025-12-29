"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Radio, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/lessons", label: "الدروس", icon: BookOpen },
    { href: "/live", label: "البث المباشر", icon: Radio },
    // Admin only
    { href: "/admin/dashboard", label: "الإدارة", icon: Users, adminOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role, logout } = useAuth();

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col z-50 transition-transform duration-300">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-white/5">
                <h1 className="text-2xl font-bold font-vazirmatn bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    BAC<span className="text-white">X</span>
                </h1>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
                {navItems.map((item) => {
                    if (item.adminOnly && role !== 'admin') return null;

                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-vazirmatn text-sm font-medium",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-zinc-500 group-hover:text-white")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-vazirmatn text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
}

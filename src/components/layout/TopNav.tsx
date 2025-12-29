"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function TopNav() {
    const { user } = useAuth();

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
            {/* Search Bar (Visual Only) */}
            <div className="relative w-96 hidden md:block">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="ابحث عن درس، أستاذ، أو موضوع..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 transition-all"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5 text-zinc-400" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black" />
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                    <div className="text-left hidden md:block">
                        <div className="text-sm font-bold text-white font-vazirmatn">{user?.displayName || "طالب نجيب"}</div>
                        <div className="text-xs text-zinc-500 font-vazirmatn text-right">المستوى النهائي</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                        {user?.displayName?.[0]?.toUpperCase() || "S"}
                    </div>
                </div>
            </div>
        </header>
    );
}

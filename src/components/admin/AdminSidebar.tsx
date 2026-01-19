"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    Radio, 
    BookOpen, 
    LogOut, 
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard // Overview stats
    },
    {
        title: "Students",
        href: "/admin/students",
        icon: Users // Manage students
    },
    {
        title: "Live Control",
        href: "/admin/live-control",
        icon: Radio // Live session control
    },
    {
        title: "Courses",
        href: "/admin/courses",
        icon: BookOpen // Content management
    }
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0a0a0f] border-r border-white/5 flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5 bg-black/20">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-white tracking-wide font-tajawal">BRAINY ADMIN</span>
                    <span className="text-[10px] text-blue-400 font-mono tracking-wider">MEGA STRUCTURE</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                                isActive 
                                    ? "bg-blue-600/10 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                                    : "hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <item.icon 
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                                )} 
                            />
                            <span 
                                className={cn(
                                    "font-tajawal font-medium transition-colors",
                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                )}
                            >
                                {item.title}
                            </span>
                            
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group"
                >
                    <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400" />
                    <span className="font-tajawal font-medium text-zinc-400 group-hover:text-red-300">
                        تسجيل الخروج
                    </span>
                </button>
            </div>
        </aside>
    );
}

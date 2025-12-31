"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Crown, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subjects", label: "المواد", icon: BookOpen },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useAuth();

    return (
        <aside className="fixed right-0 top-0 h-screen w-60 bg-white border-l border-slate-100 flex flex-col z-50">

            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-slate-800 tracking-tight">
                        bac<span className="text-blue-600">X</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <Icon className={cn(
                                "w-4.5 h-4.5",
                                isActive ? "text-white" : "text-slate-400"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Admin Link (if admin) */}
                {role === 'admin' && (
                    <>
                        <div className="h-px bg-slate-100 my-3" />
                        <Link
                            href="/admin"
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                                pathname.startsWith('/admin')
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            )}
                        >
                            <Crown className={cn(
                                "w-4.5 h-4.5",
                                pathname.startsWith('/admin') ? "text-white" : "text-slate-400"
                            )} />
                            لوحة التحكم
                        </Link>
                    </>
                )}
            </nav>

            {/* Footer CTA */}
            <div className="p-4 m-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700">الاشتراك المميز</h4>
                        <p className="text-[10px] text-slate-400">وصول كامل للمحتوى</p>
                    </div>
                </div>
                <Link
                    href="/subscription"
                    className="block w-full py-2 bg-slate-900 text-white text-xs font-medium rounded-lg text-center hover:bg-slate-800 transition-colors"
                >
                    ترقية الحساب
                </Link>
            </div>
        </aside>
    );
}

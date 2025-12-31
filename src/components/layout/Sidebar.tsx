"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Crown, Settings, GraduationCap } from "lucide-react";
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
        <aside className="fixed right-0 top-0 h-screen w-56 bg-white border-l border-slate-200 flex flex-col z-50">

            {/* Logo */}
            <div className="h-14 flex items-center px-5 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-800 tracking-tight">
                        bac<span className="text-blue-600">X</span>
                    </span>
                </Link>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 py-4 px-3">
                <div className="mb-6">
                    <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        القائمة الرئيسية
                    </p>
                    <nav className="space-y-0.5">
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
                                        "nav-item",
                                        isActive && "active"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Admin Section */}
                {role === 'admin' && (
                    <div>
                        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            الإدارة
                        </p>
                        <nav className="space-y-0.5">
                            <Link
                                href="/admin"
                                prefetch={true}
                                className={cn(
                                    "nav-item",
                                    pathname.startsWith('/admin') && "active"
                                )}
                            >
                                <Settings className="w-4 h-4" />
                                لوحة التحكم
                            </Link>
                        </nav>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded">
                    <p className="text-xs font-medium text-slate-600 mb-1">الاشتراك المميز</p>
                    <p className="text-[10px] text-slate-400 mb-3">وصول كامل لجميع المحتوى</p>
                    <Link
                        href="/subscription"
                        className="btn-primary w-full text-xs"
                    >
                        ترقية الحساب
                    </Link>
                </div>
            </div>
        </aside>
    );
}

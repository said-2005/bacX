"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, Profiler, useCallback } from "react";
import { Home, User, Crown, Settings, ChevronDown, ChevronRight, Brain, Calculator, FlaskConical, Microscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrainyLogo } from "@/components/ui/BrainyLogo";

// ============================================================================
// SIDEBAR v7 - SURGICAL BIOPSY WITH CONSOLE TIMERS
// ============================================================================

const NAV = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/subscription", label: "الاشتراك", icon: Crown },
    { href: "/profile", label: "الحساب", icon: User },
];

const SUBJECTS = [
    { id: "math", label: "الرياضيات", icon: Calculator },
    { id: "physics", label: "الفيزياء", icon: FlaskConical },
    { id: "science", label: "العلوم", icon: Microscope },
    { id: "philosophy", label: "الفلسفة", icon: Brain },
];

export function Sidebar() {
    console.time('🔴 SIDEBAR_FULL_RENDER');
    console.time('🔴 SIDEBAR_HOOKS');

    const pathname = usePathname();
    const router = useRouter();
    const { profile } = useAuth();
    const [open, setOpen] = useState(true);
    const [isPending, startTransition] = useTransition();

    console.timeEnd('🔴 SIDEBAR_HOOKS');

    console.time('🔴 SIDEBAR_DERIVED_STATE');
    const isAdmin = profile?.role === "admin";
    console.timeEnd('🔴 SIDEBAR_DERIVED_STATE');

    // Navigation handler
    const navigate = (href: string, e: React.MouseEvent) => {
        e.preventDefault();
        console.time('🔴 NAVIGATE_HANDLER');

        console.log(`[NAV] Click: ${href} @ ${new Date().toISOString()}`);
        if (typeof window !== "undefined") {
            window.__DIAG_NAV_START?.(href);
            window.__DIAG_CHECKPOINT?.("SIDEBAR_CLICK");
        }

        if (pathname === href) {
            console.timeEnd('🔴 NAVIGATE_HANDLER');
            return;
        }

        startTransition(() => {
            console.time('🔴 ROUTER_PUSH');
            router.push(href);
            console.timeEnd('🔴 ROUTER_PUSH');
        });
        console.timeEnd('🔴 NAVIGATE_HANDLER');
    };

    // Profiler callback
    const onRenderCallback = useCallback((
        id: string,
        phase: "mount" | "update" | "nested-update",
        actualDuration: number,
    ) => {
        if (typeof window !== "undefined" && window.__DIAG_PROFILE) {
            window.__DIAG_PROFILE(id, actualDuration, phase);
        }
        if (actualDuration > 16) {
            console.warn(`[PROFILER] ${id} took ${actualDuration.toFixed(1)}ms (${phase})`);
        }
    }, []);

    console.time('🔴 SIDEBAR_JSX_BUILD');
    const result = (
        <Profiler id="Sidebar" onRender={onRenderCallback}>
            <div className="w-full h-full flex flex-col">
                {/* Pending indicator */}
                {isPending && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse z-50" />
                )}

                {/* Logo */}
                <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                    <a href="/dashboard" onClick={(e) => navigate("/dashboard", e)}>
                        <BrainyLogo variant="navbar" className="h-12 w-auto" />
                    </a>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
                    {(() => {
                        console.time('🔴 NAV_MAP');
                        const navItems = NAV.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={(e) => navigate(href, e)}
                                    className={`relative flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${active ? "bg-primary/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"} ${isPending ? "pointer-events-none opacity-70" : ""}`}
                                >
                                    {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full shadow-[0_0_20px_rgba(37,99,235,0.8)]" />}
                                    <Icon className={`w-6 h-6 ${active ? "text-primary" : ""}`} />
                                    <span className="text-base font-medium">{label}</span>
                                </a>
                            );
                        });
                        console.timeEnd('🔴 NAV_MAP');
                        return <div className="space-y-2">{navItems}</div>;
                    })()}

                    {/* Subjects */}
                    <div>
                        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/60">
                            <span>المواد الدراسية</span>
                            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>

                        {open && (() => {
                            console.time('🔴 SUBJECTS_MAP');
                            const subjectItems = (
                                <div className="space-y-1 mt-2">
                                    {SUBJECTS.map(({ id, label, icon: Icon }) => {
                                        const active = pathname.includes(id);
                                        const href = `/subject/${id}`;
                                        return (
                                            <a
                                                key={id}
                                                href={href}
                                                onClick={(e) => navigate(href, e)}
                                                className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all mr-4 cursor-pointer ${active ? "bg-primary/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"} ${isPending ? "pointer-events-none opacity-70" : ""}`}
                                            >
                                                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                                                <span className="text-sm font-medium">{label}</span>
                                            </a>
                                        );
                                    })}
                                    <a
                                        href="/subjects"
                                        onClick={(e) => navigate("/subjects", e)}
                                        className={`flex items-center gap-4 px-6 py-3 text-sm text-primary/70 hover:text-primary mr-4 cursor-pointer ${isPending ? "pointer-events-none opacity-70" : ""}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                        <span>عرض كل المواد...</span>
                                    </a>
                                </div>
                            );
                            console.timeEnd('🔴 SUBJECTS_MAP');
                            return subjectItems;
                        })()}
                    </div>

                    {/* Admin */}
                    {isAdmin && (
                        <div className="pt-4 border-t border-white/5 mx-4">
                            <a
                                href="/admin"
                                onClick={(e) => navigate("/admin", e)}
                                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all cursor-pointer ${pathname.startsWith("/admin") ? "bg-red-500/10 text-red-500" : "text-white/60 hover:text-red-400 hover:bg-red-500/5"} ${isPending ? "pointer-events-none opacity-70" : ""}`}
                            >
                                <Settings className="w-6 h-6" />
                                <span className="font-medium">لوحة التحكم</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Upgrade Card */}
                <div className="p-6">
                    <a
                        href="/subscription"
                        onClick={(e) => navigate("/subscription", e)}
                        className={`block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-500 cursor-pointer ${isPending ? "pointer-events-none opacity-70" : ""}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-base mb-1">ترقية الحساب</h4>
                                <p className="text-xs text-white/50">افتح جميع الدروس والتمارين الآن</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </Profiler>
    );
    console.timeEnd('🔴 SIDEBAR_JSX_BUILD');
    console.timeEnd('🔴 SIDEBAR_FULL_RENDER');

    return result;
}

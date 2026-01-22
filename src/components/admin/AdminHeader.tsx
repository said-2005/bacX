import { Bell, Search, Link as LinkIcon, Save, Circle, LogOut, User, ChevronDown } from "lucide-react";
import { AdminGlassCard } from "./ui/AdminGlassCard";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export function AdminHeader() {
    const { logout, profile } = useAuth();
    const [liveLinkOpen, setLiveLinkOpen] = useState(false);
    const [liveLink, setLiveLink] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUpdateLiveLink = () => {
        // Placeholder for actual update logic
        if (!liveLink) return;
        toast.success("Live session link updated successfully!");
        setLiveLinkOpen(false);
        // TODO: Call actual server action here
    };

    return (
        <header className="sticky top-0 z-30 mb-8 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-8">

                {/* Left: Breadcrumbs / Title (Placeholder) */}
                <div className="flex items-center gap-4">
                    {/* Can insert dynamic breadcrumbs here */}
                    <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                        </span>
                        النظام يعمل (Operational)
                    </div>
                </div>

                {/* Center: Global Search */}
                <div className="relative hidden w-96 md:block">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="البحث عن الطلاب، الدروس..."
                        className="h-10 w-full rounded-full border border-white/10 bg-white/5 pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-0 text-right"
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Quick Live Link */}
                    <div className="relative">
                        <button
                            onClick={() => setLiveLinkOpen(!liveLinkOpen)}
                            className="flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-2 text-xs font-bold text-pink-400 hover:bg-pink-500/20 transition-colors"
                        >
                            <LinkIcon className="h-4 w-4" />
                            رابط البث (Live Link)
                        </button>

                        {liveLinkOpen && (
                            <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl">
                                <h4 className="mb-2 text-sm font-bold text-white text-right">تحديث رابط البث العام</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateLiveLink}
                                        className="rounded-lg bg-pink-600 px-3 py-2 text-white hover:bg-pink-700"
                                    >
                                        <Save className="h-4 w-4" />
                                    </button>
                                    <input
                                        value={liveLink}
                                        onChange={(e) => setLiveLink(e.target.value)}
                                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none text-right"
                                        placeholder="https://zoom.us/..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="relative rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    <div className="h-8 w-px bg-white/10" />

                    {/* ADMIN PROFILE DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2 pl-1 pr-1 py-1 rounded-full border transition-all ${isProfileOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                                <span className="text-xs font-bold text-white">AD</span>
                            </div>
                            <ChevronDown size={14} className={`text-white/50 transition-transform duration-300 ml-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-0 mt-2 w-56 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[70]"
                                >
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <p className="font-bold text-sm text-white">Admin User</p>
                                        <p className="text-xs text-red-400 mt-0.5">Administrator</p>
                                    </div>
                                    <div className="p-1">
                                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <User size={14} />
                                            Student View
                                        </Link>
                                    </div>
                                    <div className="p-1 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                logout();
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut size={14} />
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </header>
    );
}

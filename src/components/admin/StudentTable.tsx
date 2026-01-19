"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    MoreVertical,
    Shield,
    ShieldOff,
    Eye,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { toggleBan, manualSubscribe } from "@/actions/admin";

interface Student {
    id: string;
    full_name: string;
    wilaya: string; // State
    branch: string;
    study_system: string;
    is_subscribed: boolean;
    banned: boolean;
    created_at: string;
}

interface StudentTableProps {
    data: Student[];
}

export function StudentTable({ data }: StudentTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        router.replace(`?${params.toString()}`);
    };

    const handleAction = async (action: string, id: string) => {
        if (action === "toggle_ban") {
            // Find current status
            const student = data.find(s => s.id === id);
            if (!student) return;

            const res = await toggleBan(id, student.banned);
            if (res.success) {
                toast.success(student.banned ? "Account Activated (Unbanned)" : "Account Deactivated (Banned)");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } else if (action === "activate_sub") {
            const res = await manualSubscribe(id);
            if (res.success) {
                toast.success("Subscription Activated");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-black/20 border-zinc-800 focus:border-blue-500/50"
                    />
                </div>
                {/* Could add filters for Branch/State here */}
            </div>

            {/* Table */}
            <GlassCard className="overflow-hidden border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-zinc-400 bg-white/5 font-tajawal">
                            <tr>
                                <th className="px-6 py-4 font-medium text-right">Full Name</th>
                                <th className="px-6 py-4 font-medium text-right">State (Wilaya)</th>
                                <th className="px-6 py-4 font-medium text-right">Branch</th>
                                <th className="px-6 py-4 font-medium text-right">System</th>
                                <th className="px-6 py-4 font-medium text-right">Status</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white font-tajawal">
                                            {student.full_name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300 font-tajawal">{student.wilaya || "-"}</td>
                                        <td className="px-6 py-4 text-zinc-300">{student.branch || "-"}</td>
                                        <td className="px-6 py-4 text-zinc-300">{student.study_system || "-"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {student.banned ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                        Banned
                                                    </span>
                                                ) : student.is_subscribed ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        VIP
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-white/5">
                                                        Free
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-150 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction("toggle_ban", student.id)}
                                                    title={student.banned ? "Unban" : "Ban"}
                                                    className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    {student.banned ? <ShieldCheckIcon /> : <ShieldAlertIcon />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction("activate_sub", student.id)}
                                                    title="Activate Subscription"
                                                    className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-blue-400 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}

function ShieldCheckIcon() {
    return <Shield className="w-4 h-4 text-emerald-500" />
}

function ShieldAlertIcon() {
    return <ShieldOff className="w-4 h-4 text-red-500" />
}

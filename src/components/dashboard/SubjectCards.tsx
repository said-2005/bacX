"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SubjectCard } from "./SubjectCard";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    lessons: { id: string; title: string }[];
    [key: string]: any;
}

interface SubjectCardsProps {
    query?: string;
}

export function SubjectCards({ query }: SubjectCardsProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();

            // 🚀 FETCHER: No timeout, wait as long as DB needs
            // Order by order_index if available, else created_at
            const { data, error } = await supabase
                .from('subjects')
                .select('id, name, icon, description, color, lessons(id, title)')
                .order('created_at', { ascending: true }); // Fallback sorting

            if (error) throw error;

            setSubjects((data || []).filter((s: any) => {
                const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id);
                if (!isValidUUID) console.warn("⚠️ Skipping Subject with Invalid ID:", s.id, s.name);
                return isValidUUID;
            }));
        } catch (err: any) {
            console.error("Fetch failed", err);
            setError(err.message || "Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Filter Logic (Client Side)
    const filteredSubjects = subjects.filter((s) => {
        if (!query) return true;
        const q = query.toLowerCase();
        const matchesSubject = s.name.toLowerCase().includes(q);
        const matchesLesson = s.lessons?.some((l: any) => l.title.toLowerCase().includes(q));
        return matchesSubject || matchesLesson;
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/5" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <GlassCard className="p-8 text-center border-red-500/20 max-w-md mx-auto">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">تعذر تحميل المواد</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <button
                    onClick={fetchSubjects}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg mx-auto transition-colors"
                >
                    <RefreshCw size={16} />
                    إعادة المحاولة
                </button>
            </GlassCard>
        );
    }

    if (filteredSubjects.length === 0) {
        return (
            <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-center opacity-50 space-y-4 rounded-2xl border border-white/5 bg-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-white">
                    {query ? "لا توجد نتائج" : "ابدأ رحلتك التعليمية"}
                </h3>
                <p className="text-sm text-white/40 max-w-md">
                    {query
                        ? `لم يتم العثور على مواد تطابق "${query}"`
                        : "لا توجد مواد متاحة حالياً. يرجى تصفح المسارات أو التواصل مع الإدارة."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
            ))}
        </div>
    );
}

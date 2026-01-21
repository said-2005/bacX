"use client";

import { useEffect, useState } from "react";
// import { getLessonVideoId } from "@/data/mockLibrary"; 
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, PlayCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";

import { markLessonComplete, getUserProgress } from "@/actions/progress";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface SubjectViewProps {
    subject: any;
    lessons: any[];
    isSubscribed: boolean;
}

export default function SubjectView({ subject, lessons, isSubscribed }: SubjectViewProps) {
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'all' | 'lesson' | 'exercise'>('lesson'); // Initial tab logic? Or just sectioned lists. User asked for sections.
    // "Divide the content area into two clear sections" -> Sidebar list with headers.


    // Set initial lesson
    useEffect(() => {
        if (lessons?.length > 0 && !activeLessonId) {
            setActiveLessonId(lessons[0].id);
        }
    }, [lessons, activeLessonId]);

    // Fetch Progress
    useEffect(() => {
        if (!subject.id) return;
        getUserProgress(subject.id).then((progress) => {
            const completed = new Set(progress.filter((p: any) => p.is_completed).map((p: any) => p.lesson_id));
            setCompletedLessonIds(completed);
        });
    }, [subject.id]);

    const handleLessonCompleted = async () => {
        if (!activeLessonId) return;

        // Optimistic UI Update
        setCompletedLessonIds(prev => new Set(prev).add(activeLessonId));
        toast.success("تم إكمال الدرس! 🎉");

        await markLessonComplete(activeLessonId);
    };

    const activeLesson = lessons.find((l: any) => l.id === activeLessonId) || lessons[0];

    // Safety: If no lesson found (empty list?), handle it
    if (!activeLesson) {
        return <div className="p-10 text-center text-white/50">لا توجد دروس متاحة حالياً.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/materials" className="text-white/50 hover:text-white transition-colors">← العودة</Link>
                <h1 className="text-3xl font-serif font-bold text-white">{subject.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Player (or Gate) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* PLAYER CONTAINER */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl">
                        {isSubscribed && activeLesson.video_url ? ( // Check video_url presence too
                            // AUTHORIZED
                            <EncodedVideoPlayer
                                encodedVideoId={activeLesson.video_url || ""}
                                onEnded={handleLessonCompleted}
                            />
                        ) : (
                            // GATEKEPT
                            <PremiumLockScreen />
                        )}
                    </div>

                    {/* PDF Download Button - Moved Here directly under player */}
                    {activeLesson.pdf_url && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <a
                                href={activeLesson.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-white font-bold">ملف الدرس (PDF)</span>
                                    <span className="text-xs text-white/50">اضغط للتحميل والمتابعة</span>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Active Lesson Info */}
                    <div className="p-4 flex flex-col justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                            <p className="text-white/50 text-sm flex items-center gap-2">
                                <Clock size={14} />
                                مدة الدرس: {activeLesson.duration}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Lesson List (Split into Sections) */}
                <div className="space-y-6 h-[600px] overflow-y-auto pr-2 custom-scrollbar">

                    {/* Section 1: Lessons */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-blue-400 px-2 flex items-center gap-2">
                            <PlayCircle size={18} />
                            الدروس (Lessons)
                        </h3>
                        <div className="space-y-2">
                            {lessons.filter((l: any) => !l.type || l.type === 'lesson').map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setActiveLessonId(lesson.id)}
                                    disabled={!isSubscribed && !lesson.is_free}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-right transition-all border
                                        ${activeLessonId === lesson.id
                                            ? "bg-blue-600/20 border-blue-500/50 text-white"
                                            : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                                        }
                                        ${!isSubscribed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                        ${activeLessonId === lesson.id ? "bg-blue-500 text-white" : "bg-white/10 text-white/50"}
                                    `}>
                                        {isSubscribed ? <PlayCircle size={16} /> : <Lock size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{lesson.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                <Clock size={10} /> {lesson.duration}
                                            </span>
                                            {completedLessonIds.has(lesson.id) && (
                                                <span className="text-green-400 text-[10px] flex items-center gap-1 font-bold">
                                                    <CheckCircle size={10} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {lessons.filter((l: any) => !l.type || l.type === 'lesson').length === 0 && (
                                <p className="text-white/30 text-xs px-4">لا توجد دروس مضافة.</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Exercises */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <h3 className="text-lg font-bold text-purple-400 px-2 flex items-center gap-2">
                            <FileText size={18} />
                            التمارين (Exercises)
                        </h3>
                        <div className="space-y-2">
                            {lessons.filter((l: any) => l.type === 'exercise').map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setActiveLessonId(lesson.id)}
                                    disabled={!isSubscribed && !lesson.is_free}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-right transition-all border
                                        ${activeLessonId === lesson.id
                                            ? "bg-purple-600/20 border-purple-500/50 text-white"
                                            : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                                        }
                                        ${!isSubscribed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                        ${activeLessonId === lesson.id ? "bg-purple-500 text-white" : "bg-white/10 text-white/50"}
                                    `}>
                                        {isSubscribed ? <PlayCircle size={16} /> : <Lock size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{lesson.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                <Clock size={10} /> {lesson.duration}
                                            </span>
                                            {completedLessonIds.has(lesson.id) && (
                                                <span className="text-green-400 text-[10px] flex items-center gap-1 font-bold">
                                                    <CheckCircle size={10} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {lessons.filter((l: any) => l.type === 'exercise').length === 0 && (
                                <p className="text-white/30 text-xs px-4">لا توجد تمارين مضافة.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

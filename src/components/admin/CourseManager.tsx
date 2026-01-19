"use client";

import { useState, useEffect } from "react";
import { getSubjects, getLessons, createSubject, createLesson, deleteLesson } from "@/actions/admin-content";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Video, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Types
interface Subject {
    id: string;
    title: string;
    icon: string;
}

interface Lesson {
    id: string;
    title: string;
    duration: string;
    video_url: string; // or encrypted_id
    order_index: number;
}

export function CourseManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);

    // New Item States
    const [newSubjectTitle, setNewSubjectTitle] = useState("");
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLessonData, setNewLessonData] = useState({ title: "", duration: "", video_url: "", order_index: 1 });

    // Initial Load
    useEffect(() => {
        loadSubjects();
    }, []);

    // Fetch Lessons when Subject Selected
    useEffect(() => {
        if (selectedSubject) {
            loadLessons(selectedSubject.id);
        } else {
            setLessons([]);
        }
    }, [selectedSubject]);

    const loadSubjects = async () => {
        const data = await getSubjects();
        setSubjects(data);
    };

    const loadLessons = async (subjectId: string) => {
        const data = await getLessons(subjectId);
        setLessons(data);
    };

    const handleCreateSubject = async () => {
        if (!newSubjectTitle) return;
        setLoading(true);
        try {
            await createSubject(newSubjectTitle, "book"); // Default icon
            await loadSubjects();
            setNewSubjectTitle("");
            toast.success("Subject created");
        } catch (e) {
            toast.error("Failed to create subject");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!selectedSubject || !newLessonData.title) return;
        setLoading(true);
        try {
            await createLesson({
                subject_id: selectedSubject.id,
                ...newLessonData
            });
            await loadLessons(selectedSubject.id);
            setIsAddingLesson(false);
            setNewLessonData({ title: "", duration: "", video_url: "", order_index: lessons.length + 1 });
            toast.success("Lesson created");
        } catch (e) {
            toast.error("Failed to create lesson");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteLesson(id);
            setLessons(prev => prev.filter(l => l.id !== id));
            toast.success("Lesson deleted");
        } catch (e) {
            toast.error("Failed to delete lesson");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
            {/* SUBJECTS LIST */}
            <GlassCard className="col-span-1 flex flex-col p-4 border-white/10 bg-black/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="text-blue-500" />
                    المواد (Subjects)
                </h3>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="New Subject Title..."
                        value={newSubjectTitle}
                        onChange={(e) => setNewSubjectTitle(e.target.value)}
                        className="bg-zinc-900 border-white/10"
                    />
                    <Button onClick={handleCreateSubject} disabled={loading || !newSubjectTitle} className="bg-blue-600">
                        <Plus size={18} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between
                                ${selectedSubject?.id === subject.id
                                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                                    : "bg-white/5 border-transparent hover:bg-white/10 text-zinc-400"}
                            `}
                        >
                            <span className="font-medium font-tajawal">{subject.title}</span>
                            <ChevronRight size={16} className={`transition-transform ${selectedSubject?.id === subject.id ? "rotate-180" : ""}`} />
                        </button>
                    ))}
                    {subjects.length === 0 && <p className="text-center text-zinc-600 py-4">No subjects found.</p>}
                </div>
            </GlassCard>

            {/* LESSONS LIST */}
            <GlassCard className="col-span-1 lg:col-span-2 flex flex-col p-6 border-white/10 bg-black/20">
                {!selectedSubject ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p>Select a subject to manage lessons</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-tajawal">{selectedSubject.title}</h3>
                                <p className="text-zinc-500 text-sm">Managing content for {selectedSubject.title}</p>
                            </div>
                            <Button onClick={() => setIsAddingLesson(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                <Plus size={18} className="mr-2" />
                                Add Lesson
                            </Button>
                        </div>

                        {/* ADD LESSON FORM */}
                        {isAddingLesson && (
                            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-white text-sm">New Lesson Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Lesson Title"
                                        value={newLessonData.title}
                                        onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                                        className="bg-black/40"
                                    />
                                    <Input
                                        placeholder="Duration (e.g. 45:00)"
                                        value={newLessonData.duration}
                                        onChange={(e) => setNewLessonData({ ...newLessonData, duration: e.target.value })}
                                        className="bg-black/40"
                                    />
                                    <Input
                                        placeholder="Video ID / URL"
                                        value={newLessonData.video_url}
                                        onChange={(e) => setNewLessonData({ ...newLessonData, video_url: e.target.value })}
                                        className="md:col-span-2 bg-black/40 font-mono text-xs"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsAddingLesson(false)}>Cancel</Button>
                                    <Button onClick={handleCreateLesson} disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : "Save Lesson"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* LESSONS TABLE */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <Video size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{lesson.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span>{lesson.duration}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span className="font-mono">{lesson.video_url ? "Video Linked" : "No Video"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lessons.length === 0 && !isAddingLesson && (
                                <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                                    No lessons yet. Add one to get started.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    );
}

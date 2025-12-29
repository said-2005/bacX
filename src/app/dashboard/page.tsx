"use client";

import { useAuth } from "@/context/AuthContext";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = ["الكل", "الرياضيات", "الفيزياء", "العلوم", "اللغات", "الفلسفة"];

const mockVideos = [
    {
        id: "1",
        title: "دراسة شاملة للدوال الأسية واللوغاريتمية",
        subject: "الرياضيات",
        instructor: "أستاذ نور الدين",
        duration: "45:00",
        thumbnail: "/thumbnails/math1.jpg", // Ensure placeholders exist or handle missing images
        href: "/lessons/math/1",
        progress: 60
    },
    {
        id: "2",
        title: "الميكانيك: قوانين نيوتن وتطبيقاتها",
        subject: "الفيزياء",
        instructor: "أستاذ شريفي",
        duration: "01:20:00",
        thumbnail: "/thumbnails/physics1.jpg",
        href: "/lessons/physics/2",
        progress: 0
    },
    {
        id: "3",
        title: "ملخص المناعة: الذات واللاذات",
        subject: "العلوم",
        instructor: "أستاذ بوالريش",
        duration: "30:00",
        thumbnail: "/thumbnails/science1.jpg",
        href: "/lessons/science/3",
        progress: 10
    },
    {
        id: "4",
        title: "النثر في عصر الضعف والانحطاط",
        subject: "الأدب",
        instructor: "أستاذ حيقون",
        duration: "55:00",
        thumbnail: "/thumbnails/arabic1.jpg",
        href: "/lessons/arabic/4",
        progress: 0
    },
    {
        id: "5",
        title: "الأعداد المركبة - الجزء الأول",
        subject: "الرياضيات",
        instructor: "أستاذ نور الدين",
        duration: "15:00",
        thumbnail: "/thumbnails/math2.jpg",
        href: "/lessons/math/5",
        progress: 100
    },
    {
        id: "6",
        title: "الوحدة 2: التحولات النووية",
        subject: "الفيزياء",
        instructor: "أستاذ شريفي",
        duration: "50:00",
        thumbnail: "/thumbnails/physics2.jpg",
        href: "/lessons/physics/6",
        progress: 5
    }
];

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [activeCategory, setActiveCategory] = useState("الكل");

    if (loading) return null; // handled by layout or loading.tsx usually

    const filteredVideos = activeCategory === "الكل"
        ? mockVideos
        : mockVideos.filter(v => v.subject === activeCategory);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        صباح الخير، {user?.displayName?.split(' ')[0] || "يا بطل"} 👋
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        جاهز لمواصلة التحضير للبكالوريا؟
                    </p>
                </div>

                {/* Search Bar could go here if not global, but request said 'Sidebar layout with search bar'. Global Sidebar usually doesn't have search unless collapsed.
                    We put Search in TopNav. We can add a filter search here too if needed.
                */}
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                            activeCategory === cat
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-card border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video) => (
                        <VideoCard
                            key={video.id}
                            title={video.title}
                            subject={video.subject}
                            instructor={video.instructor}
                            duration={video.duration}
                            // Use a placeholder if image fails, handled by Image usually or we provide specific placeholder
                            thumbnail={video.thumbnail.startsWith('/') ? `https://placehold.co/600x400/EEE/31343C.png?text=${video.subject}` : video.thumbnail}
                            href={video.href}
                            progress={video.progress}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

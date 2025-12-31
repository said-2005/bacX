"use client";

import { BacCountdown, ProgressWidget, AnnouncementsFeed, UpcomingLives } from "@/components/dashboard/Widgets";
import { Compass, Atom, FlaskConical, BookText, Languages, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// Subject Icons — Professional Monochromatic Style
const subjects = [
    {
        id: "math",
        name: "الرياضيات",
        icon: Compass,
        description: "التحليل والجبر"
    },
    {
        id: "physics",
        name: "الفيزياء",
        icon: Atom,
        description: "الميكانيك والكهرباء"
    },
    {
        id: "science",
        name: "العلوم الطبيعية",
        icon: FlaskConical,
        description: "البيولوجيا والجيولوجيا"
    },
    {
        id: "philosophy",
        name: "الفلسفة",
        icon: BookText,
        description: "المنطق والفكر"
    },
    {
        id: "english",
        name: "اللغة الإنجليزية",
        icon: Languages,
        description: "القواعد والمفردات"
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.displayName?.split(' ')[0] || "طالب";

    return (
        <div className="min-h-screen">
            {/* Header — Professional Greeting */}
            <header className="mb-8">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-slate-400 tracking-wide">
                        مرحباً بعودتك
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
                        {displayName}، واصل مسار تفوقك اليوم.
                    </h1>
                </div>
            </header>

            {/* Stats Row — Clean Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <BacCountdown />
                <ProgressWidget />

                {/* Quote Card — Minimalist */}
                <div className="academic-card p-5 flex flex-col justify-center">
                    <blockquote className="text-slate-500 text-sm leading-relaxed italic">
                        &ldquo;النجاح هو مجموع مجهودات صغيرة تتكرر يوماً بعد يوم.&rdquo;
                    </blockquote>
                    <cite className="text-xs text-slate-400 mt-3 not-italic">— روبرت كولير</cite>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column — Feeds */}
                <div className="lg:col-span-2 space-y-6">
                    <AnnouncementsFeed />
                    <UpcomingLives />
                </div>

                {/* Right Column — Subjects */}
                <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">المواد الدراسية</h2>
                        <Link
                            href="/subjects"
                            className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                            عرض الكل
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {subjects.map((subject) => {
                            const Icon = subject.icon;
                            return (
                                <Link
                                    key={subject.id}
                                    href={`/subject/${subject.id}`}
                                    prefetch={true}
                                    className="group academic-card p-4 flex items-center gap-4"
                                >
                                    {/* Icon Container */}
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors duration-200">
                                        <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                            {subject.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 truncate">
                                            {subject.description}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

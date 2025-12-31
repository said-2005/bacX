"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Compass, Atom, FlaskConical, BookText, Languages,
    Clock, TrendingUp, Bell, ChevronLeft, ExternalLink,
    LockKeyhole, CheckCircle, Circle
} from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours, format } from "date-fns";
import { ar } from "date-fns/locale";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// =============================================================================
// SUBJECTS DATA — Enterprise Structure
// =============================================================================
type SubjectStatus = 'in-progress' | 'completed' | 'locked';

interface Subject {
    id: string;
    name: string;
    icon: React.ElementType;
    lessonsCompleted: number;
    totalLessons: number;
    status: SubjectStatus;
    lastAccessed?: string;
}

const subjects: Subject[] = [
    {
        id: "math",
        name: "الرياضيات",
        icon: Compass,
        lessonsCompleted: 12,
        totalLessons: 45,
        status: 'in-progress',
        lastAccessed: "اليوم"
    },
    {
        id: "physics",
        name: "الفيزياء",
        icon: Atom,
        lessonsCompleted: 8,
        totalLessons: 38,
        status: 'in-progress',
        lastAccessed: "أمس"
    },
    {
        id: "science",
        name: "العلوم الطبيعية",
        icon: FlaskConical,
        lessonsCompleted: 22,
        totalLessons: 22,
        status: 'completed',
        lastAccessed: "منذ 3 أيام"
    },
    {
        id: "philosophy",
        name: "الفلسفة",
        icon: BookText,
        lessonsCompleted: 0,
        totalLessons: 28,
        status: 'locked'
    },
    {
        id: "english",
        name: "اللغة الإنجليزية",
        icon: Languages,
        lessonsCompleted: 5,
        totalLessons: 32,
        status: 'in-progress',
        lastAccessed: "منذ أسبوع"
    },
];

// =============================================================================
// MAIN DASHBOARD
// =============================================================================
export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.displayName || "المستخدم";

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    لوحة التحكم
                </p>
                <h1 className="text-xl font-bold text-slate-900">
                    مرحباً، {displayName}
                </h1>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <BacCountdownMetric />
                <ProgressMetric />
                <LessonsMetric />
                <ExercisesMetric />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subjects Table — 2 Columns */}
                <div className="lg:col-span-2">
                    <SubjectsTable subjects={subjects} />
                </div>

                {/* Notice Board — 1 Column */}
                <div className="lg:col-span-1">
                    <NoticeBoard />
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// METRIC CARDS
// =============================================================================
function BacCountdownMetric() {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const bacDate = new Date("2025-06-01T08:00:00");

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setDays(differenceInDays(bacDate, now));
            setHours(differenceInHours(bacDate, now) % 24);
        };
        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="metric-card">
            <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="metric-label mb-0">البكالوريا 2025</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="metric-value">{days}</span>
                <span className="metric-unit">يوم</span>
                <span className="text-lg font-semibold text-slate-400 mx-1">:</span>
                <span className="text-xl font-semibold text-slate-600">{hours}</span>
                <span className="metric-unit">ساعة</span>
            </div>
        </div>
    );
}

function ProgressMetric() {
    const progress = 35;
    return (
        <div className="metric-card">
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="metric-label mb-0">التقدم العام</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
                <span className="metric-value">{progress}</span>
                <span className="metric-unit">%</span>
            </div>
            <div className="progress-thin">
                <div
                    className="progress-thin-fill bg-emerald-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

function LessonsMetric() {
    return (
        <div className="metric-card">
            <span className="metric-label">الدروس المكتملة</span>
            <div className="flex items-baseline gap-1">
                <span className="metric-value">47</span>
                <span className="text-sm text-slate-400">/ 165</span>
            </div>
        </div>
    );
}

function ExercisesMetric() {
    return (
        <div className="metric-card">
            <span className="metric-label">التمارين المحلولة</span>
            <div className="flex items-baseline gap-1">
                <span className="metric-value">124</span>
                <span className="text-sm text-slate-400">تمرين</span>
            </div>
        </div>
    );
}

// =============================================================================
// SUBJECTS TABLE
// =============================================================================
function SubjectsTable({ subjects }: { subjects: Subject[] }) {
    const getStatusChip = (status: SubjectStatus) => {
        switch (status) {
            case 'completed':
                return <span className="status-chip status-completed">مكتمل</span>;
            case 'in-progress':
                return <span className="status-chip status-in-progress">جاري</span>;
            case 'locked':
                return <span className="status-chip status-locked">مغلق</span>;
        }
    };

    const getStatusIcon = (status: SubjectStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'in-progress':
                return <Circle className="w-4 h-4 text-blue-500" />;
            case 'locked':
                return <LockKeyhole className="w-4 h-4 text-slate-300" />;
        }
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <h2 className="panel-title">المواد الدراسية</h2>
                <Link
                    href="/subjects"
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                    عرض الكل
                    <ChevronLeft className="w-3 h-3" />
                </Link>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>المادة</th>
                        <th>التقدم</th>
                        <th>الحالة</th>
                        <th>آخر نشاط</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((subject) => {
                        const Icon = subject.icon;
                        const progressPercent = Math.round((subject.lessonsCompleted / subject.totalLessons) * 100);

                        return (
                            <tr key={subject.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded bg-slate-50 flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">{subject.name}</div>
                                            <div className="text-xs text-slate-400">
                                                {subject.lessonsCompleted} / {subject.totalLessons} درس
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="w-24">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">{progressPercent}%</span>
                                        </div>
                                        <div className="progress-thin">
                                            <div
                                                className={`progress-thin-fill ${subject.status === 'completed' ? 'bg-emerald-500' :
                                                        subject.status === 'in-progress' ? 'bg-blue-500' :
                                                            'bg-slate-200'
                                                    }`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(subject.status)}
                                        {getStatusChip(subject.status)}
                                    </div>
                                </td>
                                <td>
                                    <span className="text-xs text-slate-400">
                                        {subject.lastAccessed || "—"}
                                    </span>
                                </td>
                                <td>
                                    {subject.status !== 'locked' && (
                                        <Link
                                            href={`/subject/${subject.id}`}
                                            className="p-2 hover:bg-slate-50 rounded transition-colors inline-flex"
                                        >
                                            <ExternalLink className="w-4 h-4 text-slate-400" />
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// =============================================================================
// NOTICE BOARD
// =============================================================================
interface Announcement {
    id: string;
    content: string;
    createdAt: { toDate: () => Date };
    priority?: 'high' | 'medium' | 'info';
}

function NoticeBoard() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getPriorityChip = (priority?: string) => {
        switch (priority) {
            case 'high':
                return <span className="status-chip status-high">عاجل</span>;
            case 'medium':
                return <span className="status-chip status-medium">متوسط</span>;
            default:
                return <span className="status-chip status-info">إعلام</span>;
        }
    };

    return (
        <div className="panel h-full">
            <div className="panel-header">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <h2 className="panel-title mb-0">لوحة الإعلانات</h2>
                </div>
            </div>

            <div className="divide-y divide-slate-50">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-sm text-slate-400">جاري التحميل...</div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-sm text-slate-400">لا توجد إعلانات</div>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="notice-item">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getPriorityChip(ann.priority)}
                                    <span className="notice-timestamp">
                                        {ann.createdAt?.toDate
                                            ? format(ann.createdAt.toDate(), "d MMM, HH:mm", { locale: ar })
                                            : "الآن"
                                        }
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {ann.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

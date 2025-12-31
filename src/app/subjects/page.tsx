import { BookOpen, Calculator, FlaskConical, Languages, Microscope, Scale, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";

// Subject data with progress tracking
const subjects = [
    { id: 'math', name: 'الرياضيات', icon: Calculator, lessons: 45, completed: 12 },
    { id: 'physics', name: 'الفيزياء', icon: FlaskConical, lessons: 38, completed: 8 },
    { id: 'science', name: 'العلوم الطبيعية', icon: Microscope, lessons: 32, completed: 22 },
    { id: 'arabic', name: 'الأدب العربي', icon: BookOpen, lessons: 28, completed: 5 },
    { id: 'languages', name: 'اللغات الأجنبية', icon: Languages, lessons: 25, completed: 10 },
    { id: 'philosophy', name: 'الفلسفة', icon: Scale, lessons: 22, completed: 0 },
];

export default function SubjectsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                <Link href="/dashboard" className="hover:text-slate-600">الرئيسية</Link>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-slate-700">المواد الدراسية</span>
            </div>

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">كتالوج المواد</h1>
                <p className="text-sm text-slate-500">اختر المادة للوصول إلى الدروس والتمارين</p>
            </header>

            {/* Subjects List — Professional Catalog */}
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">المواد المتاحة</span>
                    <span className="text-xs text-slate-400">{subjects.length} مادة</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {subjects.map((subject) => {
                        const Icon = subject.icon;
                        const progress = Math.round((subject.completed / subject.lessons) * 100);
                        const status = subject.completed === 0 ? 'new' :
                            subject.completed === subject.lessons ? 'complete' : 'progress';

                        return (
                            <Link
                                key={subject.id}
                                href={`/subject/${subject.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-slate-500" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                                        <span className={`badge ${status === 'complete' ? 'badge-success' :
                                                status === 'progress' ? 'badge-info' :
                                                    'badge-neutral'
                                            }`}>
                                            {status === 'complete' ? 'مكتمل' :
                                                status === 'progress' ? 'جاري' : 'جديد'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span>{subject.lessons} درس</span>
                                        <span>{subject.completed} مكتمل</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="w-32 hidden sm:block">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>التقدم</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="progress">
                                        <div
                                            className={`progress-fill ${status === 'complete' ? 'bg-emerald-500' : 'bg-slate-600'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronLeft className="w-4 h-4 text-slate-300" />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="metric text-center">
                    <div className="metric-value text-xl">190</div>
                    <div className="metric-label">إجمالي الدروس</div>
                </div>
                <div className="metric text-center">
                    <div className="metric-value text-xl">57</div>
                    <div className="metric-label">دروس مكتملة</div>
                </div>
                <div className="metric text-center">
                    <div className="metric-value text-xl">30%</div>
                    <div className="metric-label">نسبة الإنجاز</div>
                </div>
            </div>
        </div>
    );
}

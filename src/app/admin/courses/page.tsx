import { CourseManager } from "@/components/admin/CourseManager";

export default function CoursesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-tajawal text-white">Content Manager</h1>
                <p className="text-zinc-400 font-tajawal">Create and edit subjects and lessons.</p>
            </div>

            <CourseManager />
        </div>
    );
}

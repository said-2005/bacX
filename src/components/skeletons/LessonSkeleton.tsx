export function LessonSkeleton() {
    return (
        <div className="min-h-screen bg-[#050505] p-6 animate-pulse">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player Skeleton */}
                    <div className="aspect-video w-full bg-zinc-900/50 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                    {/* Title Skeleton */}
                    <div className="space-y-3">
                        <div className="h-8 w-3/4 bg-zinc-900 rounded-lg" />
                        <div className="h-4 w-1/3 bg-zinc-900 rounded-lg" />
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    <div className="h-40 bg-zinc-900/50 rounded-2xl border border-white/5" />
                    <div className="h-64 bg-zinc-900/50 rounded-2xl border border-white/5" />
                </div>
            </div>
        </div>
    );
}

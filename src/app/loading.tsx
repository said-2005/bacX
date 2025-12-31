/**
 * Global Loading Skeleton
 * Displays during page transitions with smooth animations
 * Uses the light theme colors to prevent "black flash"
 */
export default function Loading() {
    return (
        <main className="min-h-screen bg-background p-6 pt-8">
            <div className="max-w-6xl mx-auto animate-pulse">
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-28 bg-slate-100 rounded-2xl border border-slate-100"
                            style={{ animationDelay: `${i * 100}ms` }}
                        />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <div className="md:col-span-2 h-[400px] bg-slate-100 rounded-2xl border border-slate-100" />

                    {/* Side Cards */}
                    <div className="space-y-4">
                        <div className="h-48 bg-slate-100 rounded-2xl border border-slate-100" />
                        <div className="h-48 bg-slate-100 rounded-2xl border border-slate-100" />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-100 rounded-2xl border border-slate-100" />
                    <div className="h-32 bg-slate-100 rounded-2xl border border-slate-100" />
                </div>
            </div>
        </main>
    );
}

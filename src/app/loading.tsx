import { GlassCard } from "@/components/ui/GlassCard";

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#050505] p-6 pt-24">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {/* Profile Skeleton */}
                <GlassCard className="p-6 md:col-span-1 border-white/5 h-[300px]">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-4" />
                    <div className="h-6 w-32 bg-white/5 mx-auto rounded mb-2" />
                    <div className="h-4 w-24 bg-white/5 mx-auto rounded" />
                </GlassCard>

                {/* Main Content Skeleton */}
                <GlassCard className="p-6 md:col-span-2 border-white/5 h-[300px]">
                    <div className="h-8 w-48 bg-white/5 rounded mb-6" />
                    <div className="space-y-4">
                        <div className="h-12 w-full bg-white/5 rounded-xl" />
                        <div className="h-12 w-full bg-white/5 rounded-xl" />
                        <div className="h-12 w-full bg-white/5 rounded-xl" />
                    </div>
                </GlassCard>

                {/* Bottom Row */}
                <GlassCard className="p-6 md:col-span-3 border-white/5 h-[200px]">
                    <div className="h-8 w-48 bg-white/5 rounded mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 w-full bg-white/5 rounded-xl" />
                        <div className="h-24 w-full bg-white/5 rounded-xl" />
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}

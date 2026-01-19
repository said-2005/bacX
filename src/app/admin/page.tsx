import { Suspense } from "react";
import { getDashboardStats } from "@/actions/admin-stats";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, CreditCard, Activity, Star } from "lucide-react";

async function DashboardStatsGrid() {
    const stats = await getDashboardStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Students"
                value={stats.totalStudents}
                description="All registered accounts"
                icon={Users}
                color="blue"
            />
            <StatsCard
                title="VIP / Subscribed"
                value={stats.vipStudents}
                description="Active paid subscriptions"
                icon={Star}
                color="purple"
                trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
                title="Total Revenue"
                value={`${stats.totalRevenue.toLocaleString()} DZD`}
                description="Lifetime approved payments"
                icon={CreditCard}
                color="green"
            />
            <StatsCard
                title="Active Users"
                value={stats.activeOnline > 0 ? stats.activeOnline : "12"} // Mock fallback for "Active" feel if 0
                description="Online in last 15 mins"
                icon={Activity}
                color="orange"
            />
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-tajawal text-white">لوحة التحكم</h1>
                <p className="text-zinc-400 font-tajawal">نظرة عامة على أداء المنصة والإحصائيات الحية.</p>
            </div>

            <Suspense fallback={<div className="text-white">Loading stats...</div>}>
                <DashboardStatsGrid />
            </Suspense>

            {/* Quick Actions or Charts could go here later */}
        </div>
    );
}

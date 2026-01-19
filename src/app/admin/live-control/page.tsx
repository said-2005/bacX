import AdminLiveDashboard from "@/components/admin/AdminLiveDashboard";

export default function LiveControlPage() {
    return (
        <div className="space-y-6">
            {/* We just wrap the existing component for now, adding the new features into it or alongside it */}
            <AdminLiveDashboard />

            {/* Will add RaiseHandQueue and ChatMonitor here */}
        </div>
    );
}

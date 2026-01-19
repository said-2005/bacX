import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // Check for admin role
    // METHOD 1: Check user_metadata (if you put role there)
    const role = session.user.user_metadata?.role;

    // METHOD 2: Check active profiles table (more secure/typical)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    const userRole = profile?.role || role;

    if (userRole !== "admin") {
        console.warn(`Unauthorized access attempt to /admin by user ${session.user.id} with role ${userRole}`);
        redirect("/dashboard"); // Redirect non-admins to normal dashboard
    }

    return (
        <div className="min-h-screen bg-[#050508] text-white selection:bg-blue-500/30">
            <AdminSidebar />
            <main className="pl-64 min-h-screen relative">
                {/* Background Ambient Glow */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

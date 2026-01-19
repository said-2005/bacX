import { Suspense } from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { StudentTable } from "@/components/admin/StudentTable";

// Note: Using searchParams in a server component requires Next.js 13+ Page props or hook? 
// In Next.js 15 (which this seems to be or latest 14), page props `searchParams` is a promise or object.
// Checking package.json... "next": "16.1.1". So searchParams is a Promise.

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function StudentsPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams;
    const query = typeof searchParams.query === 'string' ? searchParams.query : '';

    const adminClient = createAdminClient();

    let queryBuilder = adminClient
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // Exclude admins
        .order('created_at', { ascending: false });

    if (query) {
        queryBuilder = queryBuilder.ilike('full_name', `%${query}%`);
    }

    const { data: students, error } = await queryBuilder;

    if (error) {
        console.error("Error fetching students:", error);
        return <div className="text-red-500">Error loading students</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-tajawal text-white">Student Management</h1>
                <p className="text-zinc-400 font-tajawal">Manage all registered students, subscriptions, and account status.</p>
            </div>

            <Suspense fallback={<div className="text-white">Loading table...</div>}>
                <StudentTable data={students || []} />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"
import AdminDashboardSkeleton from "@/components/admin/admin-dashboard-skeleton" 


export const metadata: Metadata = {
    title: "Admin Dashboard | Code Battle Ground",
    description: "Admin dashboard for Code Battle Ground platform",
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions) as { user: { role: string } }

    // Double-check authorization
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Monitor platform activity and manage users</p>
            </div>

            <Suspense fallback={<AdminDashboardSkeleton />}>
                <AdminDashboard />
            </Suspense>
        </div>
    )
}


import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions) as { user: { role: string } }

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar />
            <div className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</div>
        </div>
    )
}


import { Suspense } from "react"
import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import AnalyticsSkeleton from "@/components/admin/analytics-skeleton"

export const metadata: Metadata = {
    title: "Analytics | Admin Dashboard",
    description: "Platform analytics and insights",
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Platform performance and user engagement metrics</p>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges</TabsTrigger>
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <Suspense fallback={<AnalyticsSkeleton />}>
                        <AnalyticsDashboard type="overview" />
                    </Suspense>
                </TabsContent>
                <TabsContent value="users" className="mt-6">
                    <Suspense fallback={<AnalyticsSkeleton />}>
                        <AnalyticsDashboard type="users" />
                    </Suspense>
                </TabsContent>
                <TabsContent value="challenges" className="mt-6">
                    <Suspense fallback={<AnalyticsSkeleton />}>
                        <AnalyticsDashboard type="challenges" />
                    </Suspense>
                </TabsContent>
                <TabsContent value="submissions" className="mt-6">
                    <Suspense fallback={<AnalyticsSkeleton />}>
                        <AnalyticsDashboard type="submissions" />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}


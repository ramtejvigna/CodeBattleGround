import { Suspense } from "react"
import type { Metadata } from "next"
import UsersTable from "@/components/admin/users-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus, RefreshCw } from "lucide-react"
import UsersTableSkeleton from "@/components/admin/users-table-skeleton"

export const metadata: Metadata = {
    title: "User Management | Admin Dashboard",
    description: "Manage users on the Code Battle Ground platform",
}

export default function UsersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">View and manage all users on the platform</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button size="sm" className="h-9">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Users</CardTitle>
                                    <CardDescription>Manage users and their permissions</CardDescription>
                                </div>
                                <Button variant="outline" size="icon">
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Refresh</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<UsersTableSkeleton />}>
                                <UsersTable />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="active" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Users</CardTitle>
                            <CardDescription>Users who have been active in the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<UsersTableSkeleton />}>
                                <UsersTable filter="active" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inactive" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inactive Users</CardTitle>
                            <CardDescription>Users who have not been active in the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<UsersTableSkeleton />}>
                                <UsersTable filter="inactive" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="admins" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Users</CardTitle>
                            <CardDescription>Users with administrative privileges</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<UsersTableSkeleton />}>
                                <UsersTable filter="admin" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


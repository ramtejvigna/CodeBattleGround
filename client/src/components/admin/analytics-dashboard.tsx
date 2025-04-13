"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserActivityChart } from "./charts/user-activity-chart"
import { UserGrowthChart } from "./charts/user-growth-chart"
import { ChallengeCompletionChart } from "./charts/challenge-completion-chart"
import { UsersByLanguageChart } from "./charts/users-by-language-chart"
import { UsersByLevelChart } from "./charts/users-by-level-chart"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsDashboardProps {
    type: "overview" | "users" | "challenges" | "submissions"
}

export default function AnalyticsDashboard({ type }: AnalyticsDashboardProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalChallenges: 0,
        totalSubmissions: 0,
        completionRate: 0,
        newUsersToday: 0,
        activeUsersToday: 0,
    })

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch(`/api/admin/analytics/${type}`)
                const data = await response.json()

                if (data.success) {
                    setStats(data.stats)
                }

                setIsLoading(false)
            } catch (error) {
                console.error(`Error fetching ${type} analytics data:`, error)
                setIsLoading(false)
            }
        }

        fetchAnalyticsData()
    }, [type])

    return (
        <div className="space-y-8">
            {/* Overview Section */}
            {type === "overview" && (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">+{stats.newUsersToday} today</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total users
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
                                <FileCode className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stats.totalChallenges.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">Across all difficulty levels</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.totalSubmissions.toLocaleString()} total submissions
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>User Activity</CardTitle>
                                    <CardDescription>Daily active users over time</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <UserActivityChart className="h-[350px]" />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>New user registrations over time</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <UserGrowthChart className="h-[350px]" />}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Charts */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Challenge Completion</CardTitle>
                                <CardDescription>By difficulty level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-[250px] w-full" />
                                ) : (
                                    <ChallengeCompletionChart className="h-[250px]" />
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Users by Language</CardTitle>
                                <CardDescription>Preferred programming languages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[250px] w-full" /> : <UsersByLanguageChart className="h-[250px]" />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Users by Level</CardTitle>
                                <CardDescription>Distribution across experience levels</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[250px] w-full" /> : <UsersByLevelChart className="h-[250px]" />}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Users Analytics */}
            {type === "users" && (
                <>
                    {/* User-specific charts and data would go here */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>User Activity</CardTitle>
                                    <CardDescription>Daily active users over time</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <UserActivityChart className="h-[350px]" />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>New user registrations over time</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <UserGrowthChart className="h-[350px]" />}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Users by Language</CardTitle>
                                <CardDescription>Preferred programming languages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <UsersByLanguageChart className="h-[300px]" />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Users by Level</CardTitle>
                                <CardDescription>Distribution across experience levels</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <UsersByLevelChart className="h-[300px]" />}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Challenges Analytics */}
            {type === "challenges" && (
                <>
                    {/* Challenge-specific charts and data would go here */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Challenge Completion</CardTitle>
                                <CardDescription>By difficulty level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-[300px] w-full" />
                                ) : (
                                    <ChallengeCompletionChart className="h-[300px]" />
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Challenge Submissions</CardTitle>
                                <CardDescription>Submissions over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <UserActivityChart className="h-[300px]" />}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Submissions Analytics */}
            {type === "submissions" && (
                <>
                    {/* Submission-specific charts and data would go here */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission Success Rate</CardTitle>
                                <CardDescription>Success rate over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <UserActivityChart className="h-[300px]" />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission Volume</CardTitle>
                                <CardDescription>Total submissions over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <UserGrowthChart className="h-[300px]" />}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}

// Missing icons from imports
function Users(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    )
}

function FileCode(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="m10 13-2 2 2 2" />
            <path d="m14 17 2-2-2-2" />
        </svg>
    )
}


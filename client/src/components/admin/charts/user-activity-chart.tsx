"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface UserActivityData {
    date: string
    activeUsers: number
    newUsers: number
}

interface UserActivityChartProps {
    className?: string
}

export function UserActivityChart({ className }: UserActivityChartProps) {
    const [data, setData] = useState<UserActivityData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/admin/analytics/user-activity")
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Error fetching user activity data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fallback data for preview
    const fallbackData = [
        { date: "2023-01-01", activeUsers: 120, newUsers: 15 },
        { date: "2023-01-02", activeUsers: 132, newUsers: 18 },
        { date: "2023-01-03", activeUsers: 145, newUsers: 22 },
        { date: "2023-01-04", activeUsers: 155, newUsers: 25 },
        { date: "2023-01-05", activeUsers: 168, newUsers: 20 },
        { date: "2023-01-06", activeUsers: 172, newUsers: 16 },
        { date: "2023-01-07", activeUsers: 185, newUsers: 24 },
        { date: "2023-01-08", activeUsers: 195, newUsers: 28 },
        { date: "2023-01-09", activeUsers: 210, newUsers: 32 },
        { date: "2023-01-10", activeUsers: 225, newUsers: 30 },
        { date: "2023-01-11", activeUsers: 240, newUsers: 35 },
        { date: "2023-01-12", activeUsers: 255, newUsers: 38 },
        { date: "2023-01-13", activeUsers: 270, newUsers: 42 },
        { date: "2023-01-14", activeUsers: 285, newUsers: 45 },
    ]

    const chartData = loading || data.length === 0 ? fallbackData : data

    return (
        <ChartContainer
            config={{
                activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                },
                newUsers: {
                    label: "New Users",
                    color: "hsl(var(--chart-2))",
                },
            }}
            className={className}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                    }}
                >
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }}
                        tickMargin={10}
                    />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} tickMargin={10} />
                    <Tooltip content={<ChartTooltipContent indicator="line" />} />
                    <Line
                        type="monotone"
                        dataKey="activeUsers"
                        strokeWidth={2}
                        activeDot={{
                            r: 6,
                            style: { fill: "var(--color-activeUsers)", opacity: 0.8 },
                        }}
                        style={{
                            stroke: "var(--color-activeUsers)",
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="newUsers"
                        strokeWidth={2}
                        activeDot={{
                            r: 6,
                            style: { fill: "var(--color-newUsers)", opacity: 0.8 },
                        }}
                        style={{
                            stroke: "var(--color-newUsers)",
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}


"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface UserGrowthData {
    date: string
    users: number
}

interface UserGrowthChartProps {
    className?: string
}

export function UserGrowthChart({ className }: UserGrowthChartProps) {
    const [data, setData] = useState<UserGrowthData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/admin/analytics/user-growth")
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Error fetching user growth data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fallback data for preview
    const fallbackData = [
        { date: "2023-01", users: 120 },
        { date: "2023-02", users: 240 },
        { date: "2023-03", users: 380 },
        { date: "2023-04", users: 520 },
        { date: "2023-05", users: 650 },
        { date: "2023-06", users: 780 },
        { date: "2023-07", users: 920 },
        { date: "2023-08", users: 1050 },
        { date: "2023-09", users: 1180 },
        { date: "2023-10", users: 1320 },
        { date: "2023-11", users: 1450 },
        { date: "2023-12", users: 1580 },
    ]

    const chartData = loading || data.length === 0 ? fallbackData : data

    return (
        <div className={className}>
            <ChartContainer
                config={{
                    users: {
                        label: "Total Users",
                        color: "#8b5cf6",
                    },
                }}
                className="w-full h-full"
            >
                <ResponsiveContainer width="100%" height={330}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const [year, month] = value.split("-")
                                return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
                                    month: "short",
                                })
                            }}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickMargin={10}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickMargin={10}
                        />
                        <Tooltip
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                                />
                            }
                        />
                        <Bar
                            dataKey="users"
                            radius={[6, 6, 0, 0]}
                            fill="url(#purpleGradient)"
                        />
                        <defs>
                            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.7} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}

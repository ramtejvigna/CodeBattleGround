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
        <ChartContainer
            config={{
                users: {
                    label: "Total Users",
                    color: "hsl(var(--chart-3))",
                },
            }}
            className={className}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                            const [year, month] = value.split("-")
                            return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
                                month: "short",
                            })
                        }}
                        tickMargin={10}
                    />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} tickMargin={10} />
                    <Tooltip content={<ChartTooltipContent indicator="line" />} />
                    <Bar
                        dataKey="users"
                        radius={[4, 4, 0, 0]}
                        style={{
                            fill: "var(--color-users)",
                            opacity: 0.9,
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}


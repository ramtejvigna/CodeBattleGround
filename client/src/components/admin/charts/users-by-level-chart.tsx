"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface LevelData {
    level: string
    users: number
}

interface UsersByLevelChartProps {
    className?: string
}

export function UsersByLevelChart({ className }: UsersByLevelChartProps) {
    const [data, setData] = useState<LevelData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/admin/analytics/users-by-level")
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Error fetching level data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fallback data for preview
    const fallbackData = [
        { level: "1", users: 350 },
        { level: "2", users: 275 },
        { level: "3", users: 220 },
        { level: "4", users: 180 },
        { level: "5", users: 145 },
        { level: "6", users: 110 },
        { level: "7", users: 85 },
        { level: "8", users: 65 },
        { level: "9", users: 45 },
        { level: "10", users: 25 },
    ]

    const chartData = loading || data.length === 0 ? fallbackData : data

    return (
        <ChartContainer
            config={{
                users: {
                    label: "Users",
                    color: "hsl(var(--chart-4))",
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
                    <XAxis dataKey="level" tickLine={false} axisLine={false} tickMargin={10} />
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


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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Level {label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payload[0].value.toLocaleString()} users
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className={className}>
            <ChartContainer
                config={{
                    users: {
                        label: "Users",
                        color: "#06b6d4",
                    },
                }}
                className="w-full h-full"
            >
                <ResponsiveContainer width="100%" height={280}>
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
                            dataKey="level" 
                            tickLine={false} 
                            axisLine={false} 
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
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="users"
                            radius={[6, 6, 0, 0]}
                            fill="url(#cyanGradient)"
                            animationDuration={1000}
                            animationBegin={0}
                        />
                        <defs>
                            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0.7}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}


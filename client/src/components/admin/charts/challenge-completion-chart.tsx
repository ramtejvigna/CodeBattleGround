"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ChallengeCompletionData {
    name: string
    value: number
    color: string
}

interface ChallengeCompletionChartProps {
    className?: string
}

export function ChallengeCompletionChart({ className }: ChallengeCompletionChartProps) {
    const [data, setData] = useState<ChallengeCompletionData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/admin/analytics/challenge-completion")
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Error fetching challenge completion data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fallback data for preview
    const fallbackData = [
        { name: "Easy", value: 45, color: "#4ade80" },
        { name: "Medium", value: 30, color: "#facc15" },
        { name: "Hard", value: 15, color: "#f87171" },
        { name: "Expert", value: 10, color: "#a855f7" },
    ]

    const chartData = loading || data.length === 0 ? fallbackData : data

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {payload[0].name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payload[0].value}% of completions
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
                    easy: {
                        label: "Easy",
                        color: "#10b981",
                    },
                    medium: {
                        label: "Medium",
                        color: "#f59e0b",
                    },
                    hard: {
                        label: "Hard",
                        color: "#ef4444",
                    },
                    expert: {
                        label: "Expert",
                        color: "#8b5cf6",
                    },
                }}
                className="w-full h-full"
            >
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1000}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    stroke="white"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value, entry: any) => (
                                <span style={{ color: entry.color, fontWeight: 500 }}>
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}


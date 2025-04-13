"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
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

    return (
        <ChartContainer
            config={{
                easy: {
                    label: "Easy",
                    color: "#4ade80",
                },
                medium: {
                    label: "Medium",
                    color: "#facc15",
                },
                hard: {
                    label: "Hard",
                    color: "#f87171",
                },
                expert: {
                    label: "Expert",
                    color: "#a855f7",
                },
            }}
            className={className}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}


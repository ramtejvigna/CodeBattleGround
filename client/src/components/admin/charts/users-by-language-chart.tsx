"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface LanguageData {
    name: string
    value: number
    color: string
}

interface UsersByLanguageChartProps {
    className?: string
}

export function UsersByLanguageChart({ className }: UsersByLanguageChartProps) {
    const [data, setData] = useState<LanguageData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/admin/analytics/users-by-language")
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error("Error fetching language data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fallback data for preview
    const fallbackData = [
        { name: "JavaScript", value: 40, color: "#eab308" },
        { name: "Python", value: 30, color: "#3b82f6" },
        { name: "Java", value: 15, color: "#ef4444" },
        { name: "C++", value: 10, color: "#8b5cf6" },
        { name: "TypeScript", value: 5, color: "#0ea5e9" },
    ]

    const chartData = loading || data.length === 0 ? fallbackData : data

    return (
        <ChartContainer
            config={{
                javascript: {
                    label: "JavaScript",
                    color: "#eab308",
                },
                python: {
                    label: "Python",
                    color: "#3b82f6",
                },
                java: {
                    label: "Java",
                    color: "#ef4444",
                },
                cpp: {
                    label: "C++",
                    color: "#8b5cf6",
                },
                typescript: {
                    label: "TypeScript",
                    color: "#0ea5e9",
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


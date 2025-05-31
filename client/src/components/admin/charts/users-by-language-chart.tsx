"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
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

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {payload[0].name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payload[0].value}% of users
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
                    javascript: {
                        label: "JavaScript",
                        color: "#f7df1e",
                    },
                    python: {
                        label: "Python",
                        color: "#3776ab",
                    },
                    java: {
                        label: "Java",
                        color: "#ed8b00",
                    },
                    cpp: {
                        label: "C++",
                        color: "#00599c",
                    },
                    typescript: {
                        label: "TypeScript",
                        color: "#3178c6",
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
                            animationDuration={1200}
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


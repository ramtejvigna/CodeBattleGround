"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye } from "lucide-react"

interface Challenge {
    id: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT"
    submissions: number
    successRate: number
    category: {
        name: string
    }
}

export function TopChallengesTable() {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopChallenges = async () => {
            try {
                const response = await fetch("/api/admin/challenges/top")
                const data = await response.json()

                if (data.success) {
                    setChallenges(data.challenges)
                }
            } catch (error) {
                console.error("Error fetching top challenges:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTopChallenges()
    }, [])

    // Fallback data for preview
    const fallbackChallenges: Challenge[] = [
        {
            id: "challenge-1",
            title: "Two Sum",
            difficulty: "EASY",
            submissions: 1250,
            successRate: 85,
            category: { name: "Algorithms" },
        },
        {
            id: "challenge-2",
            title: "Reverse Linked List",
            difficulty: "MEDIUM",
            submissions: 980,
            successRate: 72,
            category: { name: "Data Structures" },
        },
        {
            id: "challenge-3",
            title: "Binary Tree Traversal",
            difficulty: "MEDIUM",
            submissions: 850,
            successRate: 68,
            category: { name: "Data Structures" },
        },
        {
            id: "challenge-4",
            title: "Dynamic Programming Challenge",
            difficulty: "HARD",
            submissions: 620,
            successRate: 45,
            category: { name: "Algorithms" },
        },
        {
            id: "challenge-5",
            title: "System Design Interview",
            difficulty: "EXPERT",
            submissions: 320,
            successRate: 30,
            category: { name: "System Design" },
        },
    ]

    const displayChallenges = loading ? [] : challenges.length > 0 ? challenges : fallbackChallenges

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "HARD":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            case "EXPERT":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Challenge</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))
                        : displayChallenges.map((challenge) => (
                            <TableRow key={challenge.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{challenge.title}</div>
                                        <div className="text-sm text-muted-foreground">{challenge.category.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                                        {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{challenge.submissions.toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <div className="w-16 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                            <div
                                                className="bg-orange-500 h-2.5 rounded-full"
                                                style={{ width: `${challenge.successRate}%` }}
                                            ></div>
                                        </div>
                                        <span>{challenge.successRate}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={`/admin/challenges/${challenge.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View challenge</span>
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}


"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Zap } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Loader from "../Loader"
import Link from "next/link"

// Types
interface Challenge {
    id: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT"
    points: number
    category: { name: string }
    description: string
    languages: string[]
    likes: number
    submissions: number
    successRate: number
    createdAt: string
    isFavorite?: boolean
}

export default function ChallengesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "all")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")
    const [activeTab, setActiveTab] = useState("all")

    // Fetch challenges
    const fetchChallenges = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/challenges")
            const data = await response.json()

            if (data.challenges) {
                setAllChallenges(data.challenges)
            }
        } catch (error) {
            console.error("Error fetching challenges:", error)
        } finally {
            setLoading(false)
        }
    }

    // Memoized filtered and sorted challenges
    const filteredChallenges = useMemo(() => {
        return allChallenges.filter(challenge => {
            // Search filter
            const matchesSearch = !searchTerm ||
                challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchTerm.toLowerCase())

            // Difficulty filter
            const matchesDifficulty = difficulty === "all" || challenge.difficulty === difficulty

            // Category filter
            const matchesCategory = category === "all" || challenge.category.name.toLowerCase() === category.toLowerCase()

            // Tab filter
            const matchesTab = activeTab === "all"
            // Add logic for other tabs based on your requirements
            // For example:
            // activeTab === "solved" ? challenge.isSolved :
            // activeTab === "attempted" ? challenge.isAttempted :
            // activeTab === "bookmarked" ? challenge.isBookmarked :
            // true

            return matchesSearch && matchesDifficulty && matchesCategory && matchesTab
        }).sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "most-liked":
                    return b.likes - a.likes
                case "most-submissions":
                    return b.submissions - a.submissions
                case "highest-points":
                    return b.points - a.points
                default:
                    return 0
            }
        })
    }, [allChallenges, searchTerm, difficulty, category, sortBy, activeTab])

    // Apply filters to URL
    const applyFilters = () => {
        const params = new URLSearchParams()
        if (searchTerm) params.set("search", searchTerm)
        if (difficulty !== "all") params.set("difficulty", difficulty)
        if (category !== "all") params.set("category", category)
        params.set("sortBy", sortBy)

        router.push(`/challenges?${params.toString()}`)
    }

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        applyFilters()
    }

    // Fetch challenges on mount
    useEffect(() => {
        fetchChallenges()
    }, [])

    // Get difficulty badge color
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY":
                return "bg-green-500"
            case "MEDIUM":
                return "bg-yellow-500"
            case "HARD":
                return "bg-red-500"
            case "EXPERT":
                return "bg-purple-500"
            default:
                return "bg-gray-500"
        }
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-orange-600 mb-2">Coding Challenges</h1>
                    <p className="text-gray-500">Test your skills, solve problems, and climb the leaderboard</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={16} />
                        <span>Filters</span>
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                        <Zap className="mr-2 h-4 w-4" />
                        Create Challenge
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            type="text"
                            placeholder="Search challenges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-300"
                        />
                    </div>
                </form>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList className="bg-background border border-input">
                    <TabsTrigger value="all" className="data-[state=active]:bg-muted">
                        All Challenges
                    </TabsTrigger>
                    <TabsTrigger value="solved" className="data-[state=active]:bg-muted">
                        Solved
                    </TabsTrigger>
                    <TabsTrigger value="attempted" className="data-[state=active]:bg-muted">
                        Attempted
                    </TabsTrigger>
                    <TabsTrigger value="bookmarked" className="data-[state=active]:bg-muted">
                        Bookmarked
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Difficulty */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Difficulty</h3>
                    <RadioGroup value={difficulty} onValueChange={setDifficulty} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all-difficulties" />
                            <Label htmlFor="all-difficulties">All Difficulties</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="EASY" id="easy" />
                            <Label htmlFor="easy">Easy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MEDIUM" id="medium" />
                            <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="HARD" id="hard" />
                            <Label htmlFor="hard">Hard</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="EXPERT" id="expert" />
                            <Label htmlFor="expert">Expert</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Category */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Category</h3>
                    <RadioGroup value={category} onValueChange={setCategory} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all-categories" />
                            <Label htmlFor="all-categories">All Categories</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="algorithms" id="algorithms" />
                            <Label htmlFor="algorithms">Algorithms</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="data-structures" id="data-structures" />
                            <Label htmlFor="data-structures">Data Structures</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="system-design" id="system-design" />
                            <Label htmlFor="system-design">System Design</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Sort By */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="most-liked">Most Liked</SelectItem>
                            <SelectItem value="most-submissions">Most Submissions</SelectItem>
                            <SelectItem value="highest-points">Highest Points</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Challenges List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <Loader />
                ) : (
                    filteredChallenges.map((challenge) => (
                        <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                            <div
                                className="border border-gray-200 cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold flex items-center">
                                            {challenge.title}
                                            {challenge.isFavorite && <span className="text-yellow-400 ml-2">★</span>}
                                        </h3>
                                        <div className="flex gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(challenge.difficulty)}`}
                                            >
                                                {challenge.difficulty === "EXPERT"
                                                    ? "Expert"
                                                    : challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                                {challenge.category.name}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                {challenge.points} Points
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4">{challenge.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {challenge.languages.map((lang, index) => (
                                            <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500">
                                        <div className="flex items-center mr-4">
                                            <span>👍 {challenge.likes}</span>
                                        </div>
                                        <div className="flex items-center mr-4">
                                            <span>📝 {challenge.submissions} submissions</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span>{challenge.successRate}% success rate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
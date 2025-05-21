"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Activity,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Target,
  BarChart3,
  LineChart,
  Layers,
  RefreshCcw,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Sector,
} from "recharts"
import { useTheme } from "@/context/ThemeContext"

// Interface definitions based on Prisma schema
interface Language {
  id: string
  name: string
}

interface Challenge {
  id: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT"
  categoryId: string
  category?: {
    name: string
  }
}

interface Submission {
  id: string
  status:
    | "PENDING"
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "MEMORY_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "COMPILATION_ERROR"
  runtime?: number
  memory?: number
  createdAt: string
  challenge?: Challenge
  language?: Language
  testResults?: any
}

interface UserProfile {
  solved: number
  level: number
  points: number
  streakDays: number
  badges: UserBadge[]
  languages: {
    name: string
    percentage: number
  }[]
}

interface UserBadge {
  id: string
  name: string
  description: string
  iconType: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

interface ProcessedStats {
  totalSubmissions: number
  acceptedSubmissions: number
  successRate: number
  avgRuntime: number
  avgMemory: number
  statusDistribution: { name: string; value: number; color: string }[]
  difficultyDistribution: { name: string; value: number; color: string }[]
  languageDistribution: { name: string; value: number; percentage: number; color: string }[]
  categoryDistribution: { name: string; value: number; color: string }[]
}

interface DailyActivity {
  date: string
  count: number
  day: string
}

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case "WRONG_ANSWER":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "TIME_LIMIT_EXCEEDED":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "MEMORY_LIMIT_EXCEEDED":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "RUNTIME_ERROR":
      return <AlertTriangle className="w-4 h-4 text-orange-500" />
    case "COMPILATION_ERROR":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    default:
      return <AlertTriangle className="w-4 h-4 text-gray-500" />
  }
}

// Process submissions data
const processSubmissionsData = (
  submissions: Submission[],
  categories: { [key: string]: string } = {},
): ProcessedStats => {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      successRate: 0,
      avgRuntime: 0,
      avgMemory: 0,
      statusDistribution: [],
      difficultyDistribution: [],
      languageDistribution: [],
      categoryDistribution: [],
    }
  }

  // Count accepted submissions
  const acceptedSubmissions = submissions.filter((sub) => sub.status === "ACCEPTED").length
  const successRate = Math.round((acceptedSubmissions / submissions.length) * 100)

  // Calculate average runtime and memory
  const avgRuntime = Math.round(
    submissions.reduce((sum: number, sub) => sum + (sub.runtime || 0), 0) / submissions.length,
  )

  const avgMemory = Math.round(
    submissions.reduce((sum: number, sub) => sum + (sub.memory || 0), 0) / submissions.length,
  )

  // Status distribution
  const statusCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1
    return acc
  }, {})

  const statusColors: Record<string, string> = {
    ACCEPTED: "#10B981", // green-500
    WRONG_ANSWER: "#EF4444", // red-500
    TIME_LIMIT_EXCEEDED: "#F59E0B", // amber-500
    MEMORY_LIMIT_EXCEEDED: "#8B5CF6", // violet-500
    RUNTIME_ERROR: "#F97316", // orange-500
    COMPILATION_ERROR: "#EC4899", // pink-500
    PENDING: "#6B7280", // gray-500
  }

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    name: status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
    color: statusColors[status] || "#6B7280", // gray-500
  }))

  // Difficulty distribution
  const difficultyCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    const difficulty = sub.challenge?.difficulty || "UNKNOWN"
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {})

  const difficultyColors: Record<string, string> = {
    EASY: "#10B981", // green-500
    MEDIUM: "#F59E0B", // amber-500
    HARD: "#EF4444", // red-500
    EXPERT: "#8B5CF6", // violet-500
    UNKNOWN: "#6B7280", // gray-500
  }

  const difficultyDistribution = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
    name: difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
    value: count,
    color: difficultyColors[difficulty] || "#6B7280", // gray-500
  }))

  // Language distribution
  const languageCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    const language = sub.language?.name || "Unknown"
    acc[language] = (acc[language] || 0) + 1
    return acc
  }, {})

  const languageColors: Record<string, string> = {
    JavaScript: "#F7DF1E",
    Python: "#3776AB",
    Java: "#007396",
    "C++": "#00599C",
    TypeScript: "#3178C6",
    Go: "#00ADD8",
    Rust: "#DEA584",
    Ruby: "#CC342D",
    PHP: "#777BB4",
    Swift: "#FA7343",
    Kotlin: "#7F52FF",
    Unknown: "#6B7280", // gray-500
  }

  const languageDistribution = Object.entries(languageCounts).map(([language, count]) => ({
    name: language,
    value: count,
    percentage: Math.round((count / submissions.length) * 100),
    color: languageColors[language] || "#6B7280", // gray-500
  }))

  // Category distribution
  const categoryCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    const categoryId = sub.challenge?.categoryId || "unknown"
    const categoryName = categories[categoryId] || "Unknown"
    acc[categoryName] = (acc[categoryName] || 0) + 1
    return acc
  }, {})

  // Generate random colors for categories
  const categoryColors = [
    "#EF4444", // red-500
    "#3B82F6", // blue-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#10B981", // green-500
    "#EC4899", // pink-500
    "#6366F1", // indigo-500
    "#14B8A6", // teal-500
    "#F97316", // orange-500
    "#8B5CF6", // violet-500
  ]

  const categoryDistribution = Object.entries(categoryCounts).map(([category, count], index) => ({
    name: category,
    value: count,
    color: categoryColors[index % categoryColors.length],
  }))

  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions,
    successRate,
    avgRuntime,
    avgMemory,
    statusDistribution,
    difficultyDistribution,
    languageDistribution,
    categoryDistribution,
  }
}

// Generate daily activity data from submissions
const generateDailyActivity = (submissions: Submission[]): DailyActivity[] => {
  const today = new Date()
  const dailyActivity = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split("T")[0],
      count: 0,
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
    }
  })

  // Count submissions by date
  if (submissions && submissions.length > 0) {
    submissions.forEach((sub) => {
      const subDate = new Date(sub.createdAt).toISOString().split("T")[0]
      const dayIndex = dailyActivity.findIndex((day) => day.date === subDate)
      if (dayIndex !== -1) {
        dailyActivity[dayIndex].count += 1
      }
    })
  }

  return dailyActivity
}

// Custom active shape for 3D pie chart effect
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  const sin = Math.sin((-midAngle * Math.PI) / 180)
  const cos = Math.cos((-midAngle * Math.PI) / 180)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  )
}

interface StatisticsDashboardProps {
  userId: string | undefined
}

const StatisticsDashboard = ({ userId }: StatisticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("activity")
  const [activePieIndex, setActivePieIndex] = useState(0)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [categories, setCategories] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  // Fetch submissions data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch categories first to use in submissions processing
        const categoriesResponse = await fetch(`/api/categories`)
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
        const categoriesData = await categoriesResponse.json()

        // Convert categories array to lookup object
        const categoriesLookup = categoriesData.reduce((acc: { [key: string]: string }, cat: any) => {
          acc[cat.id] = cat.name
          return acc
        }, {})
        setCategories(categoriesLookup)

        // Fetch submissions with time range filter
        let timeFilter = ""
        const now = new Date()
        if (timeRange === "week") {
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          timeFilter = `&from=${weekAgo.toISOString()}`
        } else if (timeRange === "month") {
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          timeFilter = `&from=${monthAgo.toISOString()}`
        } else if (timeRange === "year") {
          const yearAgo = new Date(now)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          timeFilter = `&from=${yearAgo.toISOString()}`
        }

        const submissionsResponse = await fetch(`/api/users/${userId}/submissions?${timeFilter}`)
        if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions")
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)

        // Fetch user profile
        const profileResponse = await fetch(`/api/users/${userId}/profile`)
        if (!profileResponse.ok) throw new Error("Failed to fetch user profile")
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, timeRange])

  // Process submissions data
  const stats = useMemo(() => processSubmissionsData(submissions, categories), [submissions, categories])
  const dailyActivity = useMemo(() => generateDailyActivity(submissions), [submissions])

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  // Custom tooltip for charts with theme-aware styling
  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`bg-background border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} p-3 rounded-lg shadow-lg`}
        >
          <p className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate streak data
  const streakDays = userProfile?.streakDays || 0

  // Weekly progress data - calculate from submissions
  const weeklyProgress = useMemo(() => {
    const weeks: { [key: string]: { problems: number; points: number } } = {}
    const now = new Date()

    // Initialize 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7 - now.getDay())
      const weekLabel = `Week ${4 - i}`
      weeks[weekLabel] = { problems: 0, points: 0 }
    }

    // Fill with submission data
    submissions.forEach((sub) => {
      const subDate = new Date(sub.createdAt)
      const weekDiff = Math.floor((now.getTime() - subDate.getTime()) / (7 * 24 * 60 * 60 * 1000))

      if (weekDiff < 4) {
        const weekLabel = `Week ${4 - weekDiff}`
        weeks[weekLabel].problems += 1

        // Estimate points based on difficulty and status
        if (sub.status === "ACCEPTED") {
          const difficultyPoints: { [key: string]: number } = {
            EASY: 10,
            MEDIUM: 20,
            HARD: 40,
            EXPERT: 80,
          }
          weeks[weekLabel].points += difficultyPoints[sub.challenge?.difficulty || "EASY"] || 10
        }
      }
    })

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      problems: data.problems,
      points: data.points,
    }))
  }, [submissions])

  const statsCards = [
    {
      title: "Total Submissions",
      value: stats.totalSubmissions,
      icon: <Code2 className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Avg. Runtime",
      value: `${stats.avgRuntime} ms`,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Current Streak",
      value: streakDays,
      icon: <Zap className="h-5 w-5 text-purple-500" />,
    },
  ]

  // Theme-aware chart colors
  const chartGridColor = theme === "dark" ? "#374151" : "#E5E7EB" // gray-700 / gray-200
  const chartTextColor = theme === "dark" ? "#D1D5DB" : "#4B5563" // gray-300 / gray-600

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true)
    // Re-fetch data by triggering the useEffect
    const fetchData = async () => {
      try {
        const submissionsResponse = await fetch(`/api/users/${userId}/submissions?timeRange=${timeRange}`)
        if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions")
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)

        const profileResponse = await fetch(`/api/users/${userId}/profile`)
        if (!profileResponse.ok) throw new Error("Failed to fetch user profile")
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      } catch (err) {
        console.error("Error refreshing data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Statistics</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Statistics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Track your coding progress and performance</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className={`w-[180px] border-0 shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className={`border-0 shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
        {statsCards.map((card, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card
              className={`${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{card.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-24 mt-1" />
                    ) : (
                      <h3 className="text-3xl font-bold mt-1 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        {card.value}
                      </h3>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-orange-500/30 to-amber-500/30"
                        : "bg-gradient-to-br from-orange-100 to-amber-100"
                    }`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs for different statistics views */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="activity" className="w-full" onValueChange={setActiveTab}>
          <TabsList className={`mb-4 p-1 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100"} rounded-lg`}>
            <TabsTrigger
              value="activity"
              className={`rounded-md data-[state=active]:bg-white ${theme === "dark" ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" : "data-[state=active]:bg-gray-100"}`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className={`rounded-md data-[state=active]:bg-white ${theme === "dark" ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" : "data-[state=active]:bg-gray-100"}`}
            >
              <Layers className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className={`rounded-md data-[state=active]:bg-white ${theme === "dark" ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" : "data-[state=active]:bg-gray-100"}`}
            >
              <Target className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="languages"
              className={`rounded-md data-[state=active]:bg-white ${theme === "dark" ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" : "data-[state=active]:bg-gray-100"}`}
            >
              <Code2 className="h-4 w-4 mr-2" />
              Languages
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Daily Activity Chart */}
              <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Daily Challenge Activity
                  </CardTitle>
                  <CardDescription>Number of challenges solved each day</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={dailyActivity}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                            <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.8} />
                          </linearGradient>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FBBF24" stopOpacity={1} />
                            <stop offset="100%" stopColor="#F97316" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="day" tick={{ fill: chartTextColor }} />
                        <YAxis tick={{ fill: chartTextColor }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Problems Solved"
                          fill="url(#barGradient)"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {dailyActivity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={entry.count > 0 ? 1 : 0.6} />
                          ))}
                        </Bar>
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="url(#lineGradient)"
                          strokeWidth={3}
                          dot={{ fill: "#FBBF24", r: 4, strokeWidth: 2, stroke: "#F97316" }}
                          activeDot={{ r: 8, fill: "#F97316", stroke: "#FFFFFF", strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationBegin={300}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Streak Calendar */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-500" />
                    Coding Streak
                  </CardTitle>
                  <CardDescription>Your daily coding consistency</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="grid grid-cols-7 gap-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      {dailyActivity.slice(-28).map((day, i) => (
                        <motion.div
                          key={i}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                            day.count === 0
                              ? theme === "dark"
                                ? "bg-gray-800 text-gray-500"
                                : "bg-gray-100 text-gray-400"
                              : day.count >= 5
                                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                                : day.count >= 3
                                  ? "bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-md"
                                  : "bg-gradient-to-br from-orange-300 to-amber-300 text-white shadow"
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.01 }}
                          whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.2 } }}
                        >
                          {day.count > 0 && day.count}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category Distribution */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-blue-500" />
                    Problem Categories
                  </CardTitle>
                  <CardDescription>Distribution of problems by category</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : stats.categoryDistribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <Layers className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {stats.categoryDistribution.map((entry, index) => (
                            <linearGradient
                              key={`gradient-${index}`}
                              id={`colorGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                              <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={stats.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {stats.categoryDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#colorGradient-${index})`}
                              stroke={entry.color}
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ color: chartTextColor }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                    Difficulty Distribution
                  </CardTitle>
                  <CardDescription>Problems solved by difficulty level</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : stats.difficultyDistribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No difficulty data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.difficultyDistribution} layout="vertical">
                        <defs>
                          {stats.difficultyDistribution.map((entry, index) => (
                            <linearGradient
                              key={`gradient-${index}`}
                              id={`diffGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor={entry.color} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis type="number" tick={{ fill: chartTextColor }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: chartTextColor }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="value"
                          name="Problems Solved"
                          radius={[0, 4, 4, 0]}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {stats.difficultyDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#diffGradient-${index})`}
                              stroke={entry.color}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Submission Status */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-orange-500" />
                    Submission Results
                  </CardTitle>
                  <CardDescription>Distribution of submission statuses</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : stats.statusDistribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <Activity className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No submission data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {stats.statusDistribution.map((entry, index) => (
                            <linearGradient
                              key={`gradient-${index}`}
                              id={`statusGradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                              <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={stats.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {stats.statusDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#statusGradient-${index})`}
                              stroke={entry.color}
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ color: chartTextColor }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-purple-500" />
                    Weekly Progress
                  </CardTitle>
                  <CardDescription>Problems solved and points earned</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : ""}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : weeklyProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <LineChart className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No weekly progress data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={weeklyProgress}>
                        <defs>
                          <linearGradient id="problemsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
                          </linearGradient>
                          <linearGradient id="pointsGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                            <stop offset="100%" stopColor="#FBBF24" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="week" tick={{ fill: chartTextColor }} />
                        <YAxis yAxisId="left" tick={{ fill: chartTextColor }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: chartTextColor }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          yAxisId="left"
                          dataKey="problems"
                          name="Problems Solved"
                          fill="url(#problemsGradient)"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="points"
                          name="Points Earned"
                          stroke="url(#pointsGradient)"
                          strokeWidth={3}
                          dot={{ fill: "#F97316", r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
                          activeDot={{ r: 8, fill: "#F97316", stroke: "#FFFFFF", strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationBegin={300}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="mt-6">
            <motion.div
              className="grid grid-cols-1 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Language Usage */}
              <Card className="shadow-lg hover:shadow-xl border-0 rounded-xl overflow-hidden">
                <CardHeader className={`bg-gradient-to-r from-gray-50 to-gray-100 ${theme === "dark" ? "from-gray-800 to-gray-900 text-white" : ""}`}>
                  <CardTitle className="flex items-center">
                    <Code2 className="h-5 w-5 mr-2 text-blue-500" />
                    Programming Languages
                  </CardTitle>
                  <CardDescription>Distribution of languages used in submissions</CardDescription>
                </CardHeader>
                <CardContent className={`pt-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : stats.languageDistribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <Code2 className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No language data available</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <defs>
                            {stats.languageDistribution.map((entry, index) => (
                              <linearGradient
                                key={`gradient-${index}`}
                                id={`langGradient-${index}`}
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                              >
                                <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={stats.languageDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            activeIndex={activePieIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, index) => setActivePieIndex(index)}
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {stats.languageDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`url(#langGradient-${index})`}
                                stroke={entry.color}
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ color: chartTextColor }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="grid gap-3">
                        {stats.languageDistribution.map((lang, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{lang.name}</span>
                                <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
                              </div>
                              <div
                                className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
                              >
                                <motion.div
                                  className="h-2 rounded-full"
                                  style={{
                                    background: `linear-gradient(90deg, ${lang.color} 0%, ${lang.color}CC 100%)`,
                                    boxShadow: `0 0 8px ${lang.color}66`,
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${lang.percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        variants={itemVariants}
        className={`rounded-xl p-6 border-0 shadow-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"}`}
      >
        <h2 className="text-lg font-bold mb-4 flex items-center bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
          Performance Insights
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-muted-foreground">No performance data available yet</p>
            <p className="text-muted-foreground text-sm mt-2">Complete more challenges to see insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.successRate > 0 && (
              <motion.div
                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 shadow-md ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gradient-to-br from-green-500/30 to-green-400/30" : "bg-gradient-to-br from-green-100 to-green-50"}`}
                >
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium">Successful Submissions</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your success rate is {stats.successRate}%. You've solved {stats.acceptedSubmissions} problems
                    successfully.
                  </p>
                </div>
                <UIBadge
                  className={`ml-auto ${theme === "dark" ? "bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 hover:bg-green-500/30" : "bg-gradient-to-r from-green-100 to-green-50 text-green-700 hover:bg-green-200"}`}
                >
                  {stats.successRate}%
                </UIBadge>
              </motion.div>
            )}

            {stats.difficultyDistribution.some((d) => d.name.toLowerCase() === "medium" && d.value > 0) && (
              <motion.div
                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 shadow-md ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gradient-to-br from-yellow-500/30 to-yellow-400/30" : "bg-gradient-to-br from-yellow-100 to-yellow-50"}`}
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium">Medium Difficulty Progress</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You're making progress with Medium difficulty problems. Keep practicing to improve your skills.
                  </p>
                </div>
                <UIBadge
                  className={`ml-auto ${theme === "dark" ? "bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 text-yellow-400 hover:bg-yellow-500/30" : "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 hover:bg-yellow-200"}`}
                >
                  Medium
                </UIBadge>
              </motion.div>
            )}

            {streakDays > 0 && (
              <motion.div
                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 shadow-md ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gradient-to-br from-blue-500/30 to-blue-400/30" : "bg-gradient-to-br from-blue-100 to-blue-50"}`}
                >
                  <Award className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Consistent Improvement</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You've maintained a {streakDays}-day streak. Keep it up to improve your ranking!
                  </p>
                </div>
                <UIBadge
                  className={`ml-auto ${theme === "dark" ? "bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-400 hover:bg-blue-500/30" : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 hover:bg-blue-200"}`}
                >
                  {streakDays} days
                </UIBadge>
              </motion.div>
            )}

            {stats.avgRuntime > 0 && (
              <motion.div
                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 shadow-md ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gradient-to-br from-purple-500/30 to-purple-400/30" : "bg-gradient-to-br from-purple-100 to-purple-50"}`}
                >
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Runtime Performance</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your average runtime is {stats.avgRuntime} ms. Focus on optimizing your solutions for better
                    performance.
                  </p>
                </div>
                <UIBadge
                  className={`ml-auto ${theme === "dark" ? "bg-gradient-to-r from-purple-500/20 to-purple-400/20 text-purple-400 hover:bg-purple-500/30" : "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 hover:bg-purple-200"}`}
                >
                  {stats.avgRuntime} ms
                </UIBadge>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default StatisticsDashboard

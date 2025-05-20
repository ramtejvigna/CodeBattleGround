"use client"

import { useState, useEffect, useMemo } from "react"
import { Activity, Calendar, Clock, Award, TrendingUp, Code2, CheckCircle2, XCircle, AlertTriangle, Zap, Target, BarChart3, LineChart, Layers } from 'lucide-react'
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "recharts"
import { useTheme } from "@/context/ThemeContext"

// Interface definitions
interface SubmissionLanguage {
  id?: string;
  name: string;
}

interface Challenge {
  id?: string;
  title?: string;
  difficulty?: string;
}

interface Submission {
  id?: string;
  status: string;
  runtime?: string;
  createdAt: string;
  challenge?: Challenge;
  language?: SubmissionLanguage;
  memory?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface ProcessedStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  successRate: number;
  avgRuntime: number;
  statusDistribution: { name: string; value: number; color: string }[];
  difficultyDistribution: { name: string; value: number; color: string }[];
  languageDistribution: { name: string; value: number; percentage: number; color: string }[];
}

interface DailyActivity {
  date: string;
  count: number;
  day: string;
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
const processSubmissionsData = (submissions: Submission[]): ProcessedStats => {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      successRate: 0,
      avgRuntime: 0,
      statusDistribution: [],
      difficultyDistribution: [],
      languageDistribution: []
    }
  }

  // Count accepted submissions
  const acceptedSubmissions = submissions.filter(sub => sub.status === "ACCEPTED").length
  const successRate = Math.round((acceptedSubmissions / submissions.length) * 100)

  // Calculate average runtime
  const avgRuntime = Math.round(
    submissions.reduce((sum: number, sub) => sum + Number(sub.runtime || 0), 0) / submissions.length
  )

  // Status distribution
  const statusCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1
    return acc
  }, {})

  const statusColors: Record<string, string> = {
    "ACCEPTED": "#10B981", // green-500
    "WRONG_ANSWER": "#EF4444", // red-500
    "TIME_LIMIT_EXCEEDED": "#F59E0B", // amber-500
    "RUNTIME_ERROR": "#F97316", // orange-500
    "COMPILATION_ERROR": "#EC4899" // pink-500
  }

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: statusColors[status] || "#6B7280" // gray-500
  }))

  // Difficulty distribution
  const difficultyCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    const difficulty = sub.challenge?.difficulty || "UNKNOWN"
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {})

  const difficultyColors: Record<string, string> = {
    "EASY": "#10B981", // green-500
    "MEDIUM": "#F59E0B", // amber-500
    "HARD": "#EF4444", // red-500
    "EXPERT": "#8B5CF6", // violet-500
    "UNKNOWN": "#6B7280" // gray-500
  }

  const difficultyDistribution = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
    name: difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
    value: count,
    color: difficultyColors[difficulty] || "#6B7280" // gray-500
  }))

  // Language distribution
  const languageCounts = submissions.reduce((acc: Record<string, number>, sub) => {
    const language = sub.language?.name || "Unknown"
    acc[language] = (acc[language] || 0) + 1
    return acc
  }, {})

  const languageColors: Record<string, string> = {
    "JavaScript": "#F7DF1E",
    "Python": "#3776AB",
    "Java": "#007396",
    "C++": "#00599C",
    "TypeScript": "#3178C6",
    "Unknown": "#6B7280" // gray-500
  }

  const languageDistribution = Object.entries(languageCounts).map(([language, count]) => ({
    name: language,
    value: count,
    percentage: Math.round((count / submissions.length) * 100),
    color: languageColors[language] || "#6B7280" // gray-500
  }))

  return {
    totalSubmissions: submissions.length,
    acceptedSubmissions,
    successRate,
    avgRuntime,
    statusDistribution,
    difficultyDistribution,
    languageDistribution
  }
}

// Generate daily activity data
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
    submissions.forEach(sub => {
      const subDate = new Date(sub.createdAt).toISOString().split("T")[0]
      const dayIndex = dailyActivity.findIndex(day => day.date === subDate)
      if (dayIndex !== -1) {
        dailyActivity[dayIndex].count += 1
      }
    })
  }

  return dailyActivity
}

interface StatisticsDashboardProps {
  submissions: Submission[];
}

const StatisticsDashboard = ({ submissions = [] }: StatisticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("activity")
  const { theme } = useTheme();

  // Process submissions data
  const stats = useMemo(() => processSubmissionsData(submissions), [submissions])
  const dailyActivity = useMemo(() => generateDailyActivity(submissions), [submissions])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
        <div className={`bg-background border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-3 rounded-lg shadow-lg`}>
          <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
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
  const calculateStreakData = () => {
    return dailyActivity.map((day) => ({
      date: day.date,
      value: day.count > 0 ? day.count : 0,
      day: day.day,
    }))
  }

  const streakData = calculateStreakData()
  const currentStreak = streakData.reverse().findIndex(day => day.value === 0)
  const streakDays = currentStreak === -1 ? streakData.length : currentStreak

  // Mock data for categories (since we don't have real category data)
  const categoryData = [
    { name: "Arrays", value: 24, color: "#EF4444" }, // red-500
    { name: "Strings", value: 18, color: "#3B82F6" }, // blue-500
    { name: "Dynamic Programming", value: 12, color: "#F59E0B" }, // amber-500
    { name: "Trees", value: 9, color: "#8B5CF6" }, // violet-500
    { name: "Graphs", value: 6, color: "#10B981" }, // green-500
  ]

  // Weekly progress data
  const weeklyProgress = [
    { week: "Week 1", problems: 12, points: 240 },
    { week: "Week 2", problems: 15, points: 320 },
    { week: "Week 3", problems: 8, points: 180 },
    { week: "Week 4", problems: 20, points: 450 },
  ]

  const statsCards = [
    {
      title: "Total Submissions",
      value: stats.totalSubmissions,
      icon: <Code2 className="h-5 w-5 text-orange-500" />
    },
    {
      title: "Success Rate",
      value: stats.successRate,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    },
    {
      title: "Avg. Runtime",
      value: stats.avgRuntime,
      icon: <Clock className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Current Streak",
      value: streakDays,
      icon: <Zap className="h-5 w-5 text-purple-500" />
    }
  ]

  // Theme-aware chart colors
  const chartGridColor = theme === 'dark' ? '#374151' : '#E5E7EB' // gray-700 / gray-200
  const chartTextColor = theme === 'dark' ? '#D1D5DB' : '#4B5563' // gray-300 / gray-600

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track your coding progress and performance</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {statsCards.map((card, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card
              className={`${theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-900'
                } shadow-md`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      {card.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-24 mt-1" />
                    ) : (
                      <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
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
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Layers className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Target className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="languages">
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
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Daily Challenge Activity
                  </CardTitle>
                  <CardDescription>Number of challenges solved each day</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis
                          dataKey="day"
                          tick={{ fill: chartTextColor }}
                        />
                        <YAxis
                          tick={{ fill: chartTextColor }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Problems Solved" fill="#F97316" radius={[4, 4, 0, 0]}>
                          {dailyActivity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? "#F97316" : "#F97316A0"} />
                          ))}
                        </Bar>
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#FBBF24"
                          strokeWidth={2}
                          dot={{ fill: "#FBBF24", r: 4 }}
                          activeDot={{ r: 6, fill: "#FBBF24" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Streak Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-500" />
                    Coding Streak
                  </CardTitle>
                  <CardDescription>Your daily coding consistency</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="grid grid-cols-7 gap-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      {streakData.reverse().slice(0, 28).map((day, i) => (
                        <motion.div
                          key={i}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${day.value === 0
                              ? theme === 'dark' ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"
                              : day.value >= 5
                                ? "bg-orange-500 text-white"
                                : day.value >= 3
                                  ? "bg-orange-500/80 text-white"
                                  : "bg-orange-500/50 text-white"
                            }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.01 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {day.value > 0 && day.value}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-blue-500" />
                    Problem Categories
                  </CardTitle>
                  <CardDescription>Distribution of problems by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                    Difficulty Distribution
                  </CardTitle>
                  <CardDescription>Problems solved by difficulty level</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.difficultyDistribution}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis
                          type="number"
                          tick={{ fill: chartTextColor }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: chartTextColor }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Problems Solved" radius={[0, 4, 4, 0]}>
                          {stats.difficultyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-orange-500" />
                    Submission Results
                  </CardTitle>
                  <CardDescription>Distribution of submission statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {stats.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-purple-500" />
                    Weekly Progress
                  </CardTitle>
                  <CardDescription>Problems solved and points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis
                          dataKey="week"
                          tick={{ fill: chartTextColor }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fill: chartTextColor }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fill: chartTextColor }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          yAxisId="left"
                          dataKey="problems"
                          name="Problems Solved"
                          fill="#8B5CF6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="points"
                          name="Points Earned"
                          stroke="#F97316"
                          strokeWidth={2}
                          dot={{ fill: "#F97316", r: 4 }}
                          activeDot={{ r: 6, fill: "#F97316" }}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code2 className="h-5 w-5 mr-2 text-blue-500" />
                    Programming Languages
                  </CardTitle>
                  <CardDescription>Distribution of languages used in submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="grid gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stats.languageDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                          >
                            {stats.languageDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
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
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{lang.name}</span>
                                <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
                              </div>
                              <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                <motion.div
                                  className="h-2 rounded-full"
                                  style={{ backgroundColor: lang.color }}
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

      {/* Recent Performance Insights */}
      <motion.div
        variants={itemVariants}
        className={`rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Performance Insights
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Improving in Java</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your success rate in Java problems has increased. You've solved {stats.acceptedSubmissions} problems successfully.
                </p>
              </div>
              <Badge className={`ml-auto ${theme === 'dark' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                +{stats.successRate}%
              </Badge>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">Opportunity in Medium Difficulty</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  You're doing well with Medium difficulty problems. Keep practicing to improve your skills.
                </p>
              </div>
              <Badge className={`ml-auto ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                Medium
              </Badge>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">Consistent Improvement</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  You've maintained a {streakDays}-day streak. Keep it up to improve your ranking!
                </p>
              </div>
              <Badge className={`ml-auto ${theme === 'dark' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                {streakDays} days
              </Badge>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default StatisticsDashboard
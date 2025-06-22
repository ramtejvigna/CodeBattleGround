"use client"

import React, { useState, useEffect } from "react"
import {
  Code,
  Flame,
  Swords,
  Trophy,
  Users,
  Clock,
  Zap,
  Terminal,
  ArrowRight,
  BookOpen,
  Github,
  Award,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useRankingsStore } from "@/lib/store/rankingsStore"
import { useChallengesStore } from "@/lib/store/challengesStore"
import Link from "next/link"

// Define the type for a challenge

const Home = () => {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [codeTyped, setCodeTyped] = useState("")
  const [cursor, setCursor] = useState(true)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const { user } = useAuth()

  // Use our Zustand stores
  const { topUsers, fetchRankings } = useRankingsStore()
  const { challenges, fetchChallenges } = useChallengesStore()

  const exampleCode = `function findWinner(scores) {\n  return scores\n    .sort((a, b) => b.points - a.points)\n    .map(player => player.name)[0];\n}`

  // Get the most recent challenges from the store
  // Calculate a fake "time left" based on createdAt (just for display purposes)
  const activeChallenges = React.useMemo(() => {
    if (!challenges || challenges.length === 0) return []

    // Sort challenges by createdAt (newest first)
    return challenges
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4) // Take only the 4 most recent challenges
      .map((challenge) => {
        // Calculate a fake "time left" based on createdAt (just for display purposes)
        const createdDate: Date = new Date(challenge.createdAt)
        const now: Date = new Date()
        const daysDiff: number = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        const timeLeft: string =
          daysDiff < 1
            ? `${23 - now.getHours()}h ${59 - now.getMinutes()}m`
            : `${Math.max(7 - daysDiff, 1)}d ${23 - now.getHours()}h` // Assuming challenges last around 7 days

        // Calculate fake participants based on submissions count or a random number
        const participants = challenge.submissions || 0;

        return {
          title: challenge.title,
          difficulty: challenge.difficulty,
          participants,
          timeLeft,
        }
      })
  }, [challenges])

  useEffect(() => {
    let i = 0
    const typeEffect = setInterval(() => {
      if (i < exampleCode.length) {
        setCodeTyped(exampleCode.substring(0, i + 1))
        i++
      } else {
        clearInterval(typeEffect)
      }
    }, 50)

    const cursorEffect = setInterval(() => {
      setCursor((prev) => !prev)
    }, 500)

    // Challenge rotation
    const challengeRotation = setInterval(() => {
      setCurrentChallenge((prev) => (prev + 1) % activeChallenges.length)
    }, 5000)

    return () => {
      clearInterval(typeEffect)
      clearInterval(cursorEffect)
      clearInterval(challengeRotation)
    }
  }, [activeChallenges.length, exampleCode])

  useEffect(() => {
    // Fetch data from stores
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch challenges and rankings in parallel
        await Promise.all([fetchChallenges(), fetchRankings()])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchChallenges, fetchRankings])

  // Sort the leaderboard data by rank
  const leaderboard =
    topUsers && topUsers.length > 0
      ? topUsers.slice(0, 10).map((player) => {
        // Assign badges based on rank
        let badge: string = ""
        if (player.rank === 1) badge = "🏆"
        else if (player.rank === 2) badge = "🥈"
        else if (player.rank === 3) badge = "🥉"
        else if (player.rank && player.rank <= 10) badge = "⭐"

        return {
          ...player,
          badge,
        }
      })
      : []

  // Create a skeleton array for loading state
  const skeletonRows = Array(10)
    .fill(0)
    .map((_, index) => index)

  // Skeleton row component
  const SkeletonRow = () => (
    <tr className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
      <td className="py-4 px-6">
        <div className={`h-4 w-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse rounded`}></div>
      </td>
      <td className="py-4 px-6">
        <div className={`h-4 w-32 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse rounded`}></div>
      </td>
      <td className="py-4 px-6">
        <div className={`h-4 w-16 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse rounded`}></div>
      </td>
      <td className="py-4 px-6 text-right">
        <div
          className={`h-4 w-6 ml-auto ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse rounded`}
        ></div>
      </td>
    </tr>
  )

  return (
    <div className={`${theme === "dark" && "bg-gray-900 text-gray-200"} min-h-screen `}>
      {/* Hero Section */}
      <div className="pt-12 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center mb-4">
              <Flame className="text-orange-500 mr-2 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
                ONGOING TOURNAMENT
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Prove Your{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
                Coding Skills
              </span>{" "}
              in Real Battles
            </h1>

            <p className="text-gray-400 mb-6">
              Compete against the best coders, solve challenging problems, and climb the leaderboard
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={user ? "/challenge" : "/signup"}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:translate-y-[-2px] shadow-lg shadow-orange-900/30"
              >
                Join Battle <Swords className="w-4 h-4" />
              </Link>
              <Link // Link to the practice page (if available, otherwise /challenge)
                href="/challenge"
                className={`px-6 py-3 ${theme === "dark" && "bg-gray-800"} border border-gray-700 rounded-lg font-semibold flex items-center gap-2 transition-all hover:bg-gray-750 hover:border-orange-500`}
              >
                Practice Now <Terminal className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mock Coding Environment Section */}
          <div className="relative w-full max-w-md mx-auto md:max-w-none">
            {/* Background Blobs/Shapes */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>

            <div className={`relative z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"} rounded-xl p-4 shadow-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-orange-500/20`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
                </div>
                <span className="text-xs font-mono text-gray-500">main.js</span>
              </div>
              <div className={`font-mono text-sm p-4 rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                <pre className="text-green-500">{`// Find the winner with highest points`}</pre>
                <pre className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-blue-400">function</span> <span className="text-yellow-400">findWinner</span>(<span className="text-red-400">scores</span>) {"{"}
                  <br />
                  {"  "}
                  <span className="text-blue-400">return</span> <span className="text-red-400">scores</span>
                  <br />
                  {"    ."}
                  <span className="text-yellow-400">sort</span>((<span className="text-green-400">a</span>, <span className="text-green-400">b</span>) {"=>"} <span className="text-green-400">b</span>.<span className="text-white">points</span> - <span className="text-green-400">a</span>.<span className="text-white">points</span>)
                  <br />
                  {"    ."}
                  <span className="text-yellow-400">map</span>(<span className="text-blue-400">player</span> {"=>"} <span className="text-blue-400">player</span>.<span className="text-white">name</span>)
                  <br />
                  {"    ["}<span className="text-purple-400">0</span>{"];"}
                  <br />
                  {"}"}
                  <br />
                </pre>
                <pre className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-purple-400">console</span>.<span className="text-yellow-400">log</span>(
                  <span className="text-yellow-400">findWinner</span>([{'{'} name: <span className="text-green-400">'Alice'</span>, points: <span className="text-purple-400">1500</span> {'}'}, {'{'} name: <span className="text-green-400">'Bob'</span>, points: <span className="text-purple-400">2000</span> {'}'}, {'{'} name: <span className="text-green-400">'Charlie'</span>, points: <span className="text-purple-400">1800</span> {'}'}]));
                  <br />
                  <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {codeTyped.substring(exampleCode.length)}
                    <span className={`${cursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}>|</span>
                  </span>
                </pre>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Active Challenges Section */}
      <div className={`py-16 ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <Zap className="text-yellow-500 mr-2" />
              Active Challenges
            </h2>
            <Link href="/challenge">
              <button className="text-orange-500 flex items-center hover:text-orange-400 transition-colors">
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeChallenges.map((challenge, index) => (
              <div
                key={index}
                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} border  rounded-lg p-4 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-900/20 ${index === currentChallenge ? "border-orange-500 shadow-lg shadow-orange-900/20 scale-105" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${challenge.difficulty === "Hard"
                        ? "bg-red-500/20 text-red-400"
                        : challenge.difficulty === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-purple-500/20 text-purple-400"}`}
                  >
                    {/* Cast challenge.difficulty to string to satisfy type */}
                    {challenge.difficulty}
                  </span>
                  <Code className="text-gray-500" />
                </div>

                <h3 className="font-bold text-lg mb-3">{challenge.title}</h3>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {challenge.participants}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {challenge.timeLeft}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <Trophy className="text-yellow-500 mr-2" />
            Global Leaderboard
          </h2>
          <button className="text-orange-500 flex items-center hover:text-orange-400 transition-colors">
            Complete Rankings <ArrowRight className="ml-1 w-4 h-4" />
          </button> {/* TODO: Add Link to rankings page */}
        </div>

        <div
          className={`${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-400/50"} rounded-xl overflow-hidden`}
        >
          <table className="w-full">
            <thead>
              <tr
                className={`${theme === "dark" ? "bg-gray-800/70 border border-gray-700" : "bg-white border border-gray-400/50"} text-left`}
              >
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Warrior</th>
                <th className="py-4 px-6">Points</th>
                <th className="py-4 px-6 text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading state
                skeletonRows.map((index) => <SkeletonRow key={index} />)
              ) : leaderboard.length > 0 ? (
                // Actual data once loaded
                leaderboard.map((player, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${player.rank === 1
                        ? `bg-gradient-to-r ${theme === "dark" ? "from-orange-900/20" : "from-orange-500/40"} to-transparent`
                          : player.rank === 2
                            ? "bg-gradient-to-r from-gray-700/30 to-transparent" // Second place gradient
                            : player.rank === 3
                              ? "bg-gradient-to-r from-yellow-700/20 to-transparent" // Third place gradient
                              : "" // No gradient for other ranks
                        }`}
                  >
                    <td className="py-4 px-6 font-mono">{player.rank}</td>
                    <td className="py-4 px-6 font-semibold">{player.user.username}</td>
                    <td className="py-4 px-6 text-orange-400 font-mono">{player.points.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">{player.badge}</td>
                  </tr>
                ))
              ) : (
                // Empty state when no data available
                <tr className="border-t border-gray-700">
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No leaderboard data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold mb-10 text-center">
            The Ultimate{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
              Coding Competition
            </span>{" "}
            Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Terminal className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real-time Challenges</h3>
              <p className="text-gray-400">Compete in timed coding challenges against coders from around the world.</p>
            </div>

            <div
              className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <BookOpen className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Learning Pathways</h3>
              <p className="text-gray-400">
                Master algorithms, data structures, and problem-solving through guided learning paths.
              </p>
            </div>

            <div
              className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Award className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Earn Certifications</h3>
              <p className="text-gray-400">Showcase your skills with industry-recognized certifications and badges.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Coding Skills?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are improving their skills and building their reputation on Code Battle
            Ground.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Use Link for navigation */}
            <Link href="/signup" className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:translate-y-[-2px] shadow-lg shadow-orange-900/30">
              Sign Up Free <ArrowRight className="w-4 h-4" />
            </Link>
            {/* You might need a separate click handler for GitHub login depending on your auth flow */}
            <Link href="/api/auth/github" className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold flex items-center gap-2 transition-all hover:bg-gray-750 hover:border-orange-500">
              <Github className="w-4 h-4" /> Sign Up with GitHub
            </Link>
          </div>


        </div>
      )}
    </div>
  )
}

export default Home

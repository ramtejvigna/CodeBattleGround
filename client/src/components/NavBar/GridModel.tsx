"uuse client"

import Link from "next/link"
import React from "react"
import { Code, Award, MessageSquare, BarChart2, Terminal, Zap, Star } from "lucide-react"
import { useChallengesStore } from "@/lib/store"

const GridModel = () => {
  const categories = [
    {
      title: "Challenges",
      items: [
        { name: "Algorithms", icon: <Code className="w-4 h-4" />, href: "/challenge/category/algorithm" },
        { name: "Data Structures", icon: <Terminal className="w-4 h-4" />, href: "/challenge/category/data-structure" },
        { name: "System Design", icon: <BarChart2 className="w-4 h-4" />, href: "/challenge/category/system-design" },
      ],
    },
    {
      title: "Community",
      items: [
        { name: "Forums", icon: <MessageSquare className="w-4 h-4" />, href: "/community/forums" },
        { name: "Competitions", icon: <Zap className="w-4 h-4" />, href: "/community/competitions" },
        { name: "Rankings", icon: <Award className="w-4 h-4" />, href: "/community/rankings" },
      ],
    },
  ]
  
  const { challenges } = useChallengesStore((state) => state)

  const activeChallenges = React.useMemo(() => {
      if (!challenges || challenges.length === 0) return []
  
      // Sort challenges by createdAt (newest first)
      return challenges
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2) // Take only the 4 most recent challenges
        .map((challenge) => {
          // Calculate a fake "time left" based on createdAt (just for display purposes)
          const createdDate = new Date(challenge.createdAt)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          const timeLeft =
            daysDiff < 1
              ? `${23 - now.getHours()}h ${59 - now.getMinutes()}m`
              : `${Math.max(7 - daysDiff, 1)}d ${23 - now.getHours()}h`
  
          // Calculate fake participants based on submissions count or a random number
          const participants = challenge.submissions || Math.floor(Math.random() * 300) + 100
  
          return {
            title: challenge.title,
            difficulty: challenge.difficulty,
            participants,
            timeLeft,
            likes: challenge.likes || 0, // Add likes property
          }
        })
    }, [challenges])

  return (
    <div className="absolute top-16 right-8 bg-gray-900 border border-gray-700 shadow-xl rounded-lg w-[480px] z-50 animate-in fade-in-50 slide-in-from-top-5 duration-200">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-gray-400 font-medium text-sm">{category.title}</h3>
              <div className="space-y-1">
                {category.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors group"
                  >
                    <span className="text-gray-500 group-hover:text-orange-500 transition-colors">{item.icon}</span>
                    <span className="ml-2 text-gray-300 text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 border-t border-gray-800 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-800/20">
        <h3 className="text-gray-400 font-medium text-sm mb-2">Featured Challenges</h3>
        <div className="grid grid-cols-2 gap-3">
          {activeChallenges.map((challenge, idx) => (
            <div
              key={idx}
              className="bg-gray-800/70 rounded-md p-3 border border-gray-700 hover:border-orange-500/30 hover:bg-gray-800 cursor-pointer transition-all"
            >
              <h4 className="font-medium text-sm text-gray-300">{challenge.title}</h4>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-gray-400 flex items-center">
                  <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                  {challenge.likes || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GridModel

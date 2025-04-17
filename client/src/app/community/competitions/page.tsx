import type { Metadata } from "next"
import { Calendar, Clock, Search, Trophy, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "Competitions | Code Battleground",
  description: "Participate in coding competitions and win prizes",
}

// Mock data for competitions since it's not in the schema
const competitions = [
  {
    id: "1",
    title: "Weekly Algorithm Challenge",
    description:
      "Solve a series of algorithm problems in a timed competition. Top performers win prizes and recognition.",
    startDate: new Date("2023-11-05T18:00:00"),
    endDate: new Date("2023-11-05T20:00:00"),
    participants: 128,
    status: "upcoming",
    difficulty: "Medium",
    prizes: ["500 points", "Badge: Algorithm Master", "Featured on leaderboard"],
  },
  {
    id: "2",
    title: "Graph Theory Marathon",
    description:
      "Test your graph algorithm skills with 5 challenging problems. From basic traversals to complex network flows.",
    startDate: new Date("2023-10-28T15:00:00"),
    endDate: new Date("2023-10-28T18:00:00"),
    participants: 95,
    status: "active",
    difficulty: "Hard",
    prizes: ["750 points", "Badge: Graph Guru", "Featured on leaderboard"],
    progress: 65,
  },
  {
    id: "3",
    title: "Data Structure Showdown",
    description: "Implement and optimize various data structures to solve real-world problems efficiently.",
    startDate: new Date("2023-10-15T14:00:00"),
    endDate: new Date("2023-10-15T17:00:00"),
    participants: 156,
    status: "completed",
    difficulty: "Medium",
    prizes: ["600 points", "Badge: Structure Specialist", "Featured on leaderboard"],
    winners: ["alexj", "mikechen", "davidw"],
  },
  {
    id: "4",
    title: "Dynamic Programming Challenge",
    description: "Master the art of breaking down complex problems into simpler subproblems.",
    startDate: new Date("2023-11-12T16:00:00"),
    endDate: new Date("2023-11-12T19:00:00"),
    participants: 72,
    status: "upcoming",
    difficulty: "Expert",
    prizes: ["1000 points", "Badge: DP Wizard", "Featured on leaderboard"],
  },
]

export default function CompetitionsPage() {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Upcoming</Badge>
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Active</Badge>
      case "completed":
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">Completed</Badge>
      default:
        return null
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            Easy
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
            Medium
          </Badge>
        )
      case "Hard":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
            Hard
          </Badge>
        )
      case "Expert":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            Expert
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="text-gray-400">Participate in coding competitions and win prizes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search competitions..."
            className="w-full bg-gray-800/50 border-gray-700 pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitions.map((competition) => (
          <Card
            key={competition.id}
            className={`bg-gray-800/40 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/60 transition-all duration-200 ${
              competition.status === "active"
                ? "border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent"
                : ""
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                {getStatusBadge(competition.status)}
                {getDifficultyBadge(competition.difficulty)}
              </div>
              <CardTitle className="text-xl group-hover:text-orange-400 transition-colors">
                {competition.title}
              </CardTitle>
              <CardDescription>{competition.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{formatDateTime(competition.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span>
                    {Math.round((competition.endDate.getTime() - competition.startDate.getTime()) / (1000 * 60))} mins
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{competition.participants} participants</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{competition.prizes[0]}</span>
                </div>
              </div>

              {competition.status === "active" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{competition.progress}%</span>
                  </div>
                  <Progress
                    value={competition.progress}
                    className="h-2 bg-gray-700 [&>div]:bg-green-500"
                  />
                </div>
              )}

              {competition.status === "completed" && competition.winners && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Winners</h4>
                  <div className="flex flex-wrap gap-2">
                    {competition.winners.map((winner, index) => (
                      <Badge key={index} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {index + 1}. {winner}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {competition.status === "upcoming" && (
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  <Zap className="mr-2 h-4 w-4" />
                  Register
                </Button>
              )}
              {competition.status === "active" && (
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Zap className="mr-2 h-4 w-4" />
                  Join Now
                </Button>
              )}
              {competition.status === "completed" && (
                <Button variant="outline" className="w-full">
                  View Results
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

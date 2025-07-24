"use client";

import { useEffect } from "react"
import { Calendar, Clock, Search, Trophy, Users, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "@/context/ThemeContext"
import { useCompetitionStore } from "@/lib/store/competitionStore"

export default function CompetitionsPage() {
  const { theme } = useTheme();
  const { competitions, isLoading, error, fetchCompetitions, joinCompetition } = useCompetitionStore();

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const calculateProgress = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }

  const getCompetitionStatus = (startDate: string, endDate: string, status: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // If status is manually set to CANCELLED, return that
    if (status === 'CANCELLED') return 'CANCELLED';
    
    // Otherwise, determine based on dates
    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'ACTIVE';
    return 'COMPLETED';
  }

  const getStatusBadge = (startDate: string, endDate: string, status: string) => {
    const actualStatus = getCompetitionStatus(startDate, endDate, status);
    
    switch (actualStatus) {
      case "UPCOMING":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Upcoming</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Active</Badge>
      case "COMPLETED":
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Cancelled</Badge>
      default:
        return null
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            Easy
          </Badge>
        )
      case "MEDIUM":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
            Medium
          </Badge>
        )
      case "HARD":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
            Hard
          </Badge>
        )
      case "EXPERT":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            Expert
          </Badge>
        )
      default:
        return null
    }
  }

  const handleJoinCompetition = async (competitionId: string) => {
    try {
      await joinCompetition(competitionId);
      // You might want to show a success message here
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to join competition:', error);
    }
  }

  if (error) {
    return (
      <div className={`space-y-8 animate-in fade-in-50 duration-500 p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-black"}`}>Competitions</h1>
          <p className={`text-gray-400 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Participate in coding competitions and win prizes</p>
        </div>
        
        <Card className={`${theme === "dark" ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-200"}`}>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading competitions: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-in min-h-screen fade-in-50 duration-500 p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-black"}`}>Competitions</h1>
        <p className={`text-gray-400 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Participate in coding competitions and win prizes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search competitions..."
            className={`w-full pl-9 ${theme === "dark" ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className={`${theme === "dark" ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-200"} h-84 animate-pulse`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-16 bg-gray-600 rounded"></div>
                  <div className="h-6 w-12 bg-gray-600 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-600 rounded"></div>
                <div className="h-4 w-full bg-gray-600 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-600 rounded"></div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-gray-600 rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <Card className={`${theme === "dark" ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-200"}`}>
          <CardContent className="flex items-center justify-center p-8">
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              No competitions available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const currentStatus = getCompetitionStatus(competition.startDate, competition.endDate, competition.status);
            const progress = calculateProgress(competition.startDate, competition.endDate);
            
            return (
              <Card
                key={competition.id}
                className={`${theme === "dark" ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-200"} h-84 hover:border-orange-500/50 hover:bg-gray-800/60 transition-all duration-200 ${
                  currentStatus === "ACTIVE"
                    ? "border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent"
                    : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    {getStatusBadge(competition.startDate, competition.endDate, competition.status)}
                    {getDifficultyBadge(competition.difficulty)}
                  </div>
                  <CardTitle className={`text-xl group-hover:text-orange-400 transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {competition.title}
                  </CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`grid grid-cols-2 gap-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{formatDateTime(competition.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <span>
                        {Math.round((new Date(competition.endDate).getTime() - new Date(competition.startDate).getTime()) / (1000 * 60))} mins
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{competition.participants?.length || 0} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Points & Badges</span>
                    </div>
                  </div>

                  {currentStatus === "ACTIVE" && (
                    <div className="space-y-2">
                      <div className={`flex justify-between text-sm ${theme === "dark" ? "text-white" : "text-black"}`}>
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2 bg-gray-700 [&>div]:bg-green-500"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {currentStatus === "UPCOMING" && (
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      onClick={() => handleJoinCompetition(competition.id)}
                      disabled={isLoading}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                  )}
                  {currentStatus === "ACTIVE" && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleJoinCompetition(competition.id)}
                      disabled={isLoading}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {isLoading ? "Joining..." : "Join Now"}
                    </Button>
                  )}
                  {currentStatus === "COMPLETED" && (
                    <Button variant="outline" className="w-full">
                      View Results
                    </Button>
                  )}
                  {currentStatus === "CANCELLED" && (
                    <Button variant="outline" className="w-full" disabled>
                      Cancelled
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

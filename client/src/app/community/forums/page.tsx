import type { Metadata } from "next"
import Link from "next/link"
import { MessageSquare, Plus, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Forums | Code Battleground",
  description: "Discuss coding challenges and connect with other developers",
}

// Mock data for forums since it's not in the schema
const forumTopics = [
  {
    id: "1",
    title: "Tips for solving graph traversal problems?",
    description: "I'm struggling with DFS and BFS implementations. Any advice?",
    tags: ["algorithms", "graphs", "dfs", "bfs"],
    author: {
      name: "Alex Johnson",
      username: "alexj",
      image: "",
    },
    replies: 12,
    views: 156,
    createdAt: new Date("2023-10-15"),
  },
  {
    id: "2",
    title: "Best approach for the 'Valid Parentheses' challenge?",
    description: "I've tried using a stack but I'm getting edge cases wrong. Help needed!",
    tags: ["stacks", "algorithms", "challenge-help"],
    author: {
      name: "Sarah Miller",
      username: "sarahm",
      image: "",
    },
    replies: 8,
    views: 89,
    createdAt: new Date("2023-10-20"),
  },
  {
    id: "3",
    title: "How to optimize dynamic programming solutions?",
    description: "My solutions work but they're too slow for larger inputs. Looking for optimization techniques.",
    tags: ["dynamic-programming", "optimization", "algorithms"],
    author: {
      name: "Michael Chen",
      username: "mikechen",
      image: "",
    },
    replies: 15,
    views: 203,
    createdAt: new Date("2023-10-18"),
  },
  {
    id: "4",
    title: "System design resources for beginners",
    description: "What are some good resources to learn system design concepts for someone just starting out?",
    tags: ["system-design", "learning", "resources"],
    author: {
      name: "Priya Sharma",
      username: "priyash",
      image: "",
    },
    replies: 10,
    views: 175,
    createdAt: new Date("2023-10-12"),
  },
  {
    id: "5",
    title: "Feedback on my Binary Tree Level Order Traversal solution",
    description: "I've implemented a solution but I'm not sure if it's the most efficient approach.",
    tags: ["trees", "data-structures", "code-review"],
    author: {
      name: "David Wilson",
      username: "davidw",
      image: "",
    },
    replies: 6,
    views: 72,
    createdAt: new Date("2023-10-22"),
  },
]

export default function ForumsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
        <p className="text-gray-400">Discuss coding challenges and connect with other developers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search topics..." className="w-full bg-gray-800/50 border-gray-700 pl-9" />
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {forumTopics.map((topic) => (
          <Card
            key={topic.id}
            className="bg-gray-800/40 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/60 transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <Link href={`/community/forums/${topic.id}`}>
                <CardTitle className="text-xl hover:text-orange-400 transition-colors">{topic.title}</CardTitle>
              </Link>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700/50 pt-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={topic.author.image || "/placeholder.svg"} alt={topic.author.name} />
                  <AvatarFallback>{topic.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400">{topic.author.name}</span>
                <span className="text-sm text-gray-500">• {formatDate(topic.createdAt)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {topic.replies}
                </div>
                <div>{topic.views} views</div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

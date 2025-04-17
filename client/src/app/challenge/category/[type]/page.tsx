"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Flame, Brain, Shield, Sparkles, Timer,
    Box, Network, Binary, ListTree,
    Server, Cpu, Database, Cloud, LayoutGrid, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Challenge } from "@/lib/interfaces";

// Define the content for each challenge type
const challengeTypeContent = {
    "algorithm": {
        title: "Algorithm Challenges",
        description: "Sharpen your problem-solving skills in the battleground of logic and efficiency",
        gradientText: "Algorithms",
        badges: [
            { icon: Brain, text: "Problem Solving" },
            { icon: Timer, text: "Optimize" },
            { icon: Shield, text: "Compete" }
        ],
        emptyState: {
            icon: Brain,
            title: "No algorithm challenges available",
            description: "Check back soon as our community adds new algorithm challenges"
        },
        getCategoryIcon: (name: string) => {
            const category = name.toLowerCase();
            if (category.includes("dynamic")) return Brain;
            if (category.includes("graph")) return Shield;
            if (category.includes("array")) return Sparkles;
            if (category.includes("string")) return Timer;
            return Flame;
        }
    },
    "data-structure": {
        title: "Data Structure Challenges",
        description: "Master fundamental data structures with our collection of coding challenges",
        gradientText: "Data Structures",
        badges: [
            { icon: Box, text: "Structures" },
            { icon: Network, text: "Graphs" },
            { icon: Binary, text: "Efficiency" }
        ],
        emptyState: {
            icon: Box,
            title: "No data structure challenges available",
            description: "Check back soon as our community adds new data structure challenges"
        },
        getCategoryIcon: (name: string) => {
            const category = name.toLowerCase();
            if (category.includes("array") || category.includes("list")) return ListTree;
            if (category.includes("tree") || category.includes("graph")) return Network;
            if (category.includes("hash") || category.includes("map")) return Binary;
            return Box;
        }
    },
    "system-design": {
        title: "System Design Challenges",
        description: "Master the art of designing scalable and reliable systems",
        gradientText: "System Design",
        badges: [
            { icon: Server, text: "Services" },
            { icon: Database, text: "Databases" },
            { icon: Cloud, text: "Cloud" }
        ],
        emptyState: {
            icon: LayoutGrid,
            title: "No system design challenges available",
            description: "We're working on adding new system design challenges. Check back soon!"
        },
        getCategoryIcon: (name: string) => {
            const category = name.toLowerCase();
            if (category.includes("database")) return Database;
            if (category.includes("api") || category.includes("service")) return Server;
            if (category.includes("network")) return Network;
            if (category.includes("cloud")) return Cloud;
            if (category.includes("architecture")) return Cpu;
            return LayoutGrid;
        }
    }
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "Algorithm":
            return Brain;
        case "Data Structure":
            return Box;
        case "System Design":
            return Server;
        default:
            return LayoutGrid;
    }
}

export default function ChallengesPage() {
    const { theme } = useTheme();
    const params = useParams();
    const type = params.type as keyof typeof challengeTypeContent;
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await fetch(`/api/challenges/categories/${type}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch challenges');
                }
                const data = await response.json();
                setChallenges(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [type]);

    if (!challengeTypeContent[type]) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Invalid challenge type</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-pulse text-orange-500">Loading {type} challenges...</div>
            </div>
        );
    }

    const content = challengeTypeContent[type];

    return (
        <div
            className={`space-y-8 p-12 animate-in fade-in-50 duration-500 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
            style={{ opacity: 1, transition: "opacity 0.5s" }}
        >
            {/* Header Section */}
            <div className={`relative overflow-hidden bg-gradient-to-r rounded-xl p-8 mb-8`}>
                <div
                    className="flex flex-col gap-4 z-10 relative"
                    style={{ opacity: 1, transform: "translateX(0px)", transition: "opacity 0.6s, transform 0.6s" }}
                >
                    <h1 className={`text-4xl font-extrabold tracking-tight  ${theme === "dark" ? "text-gray-400" : "text-black"}`}>
                        {content.gradientText} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Challenges</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg">
                        {content.description}
                    </p>

                    <div className="flex gap-3 mt-2">
                        {content.badges.map((badge, index) => (
                            <Badge
                                key={index}
                                className="bg-orange-600/20 text-orange-400 border-orange-500/30 px-3 py-1"
                            >
                                <badge.icon className="w-4 h-4 mr-1" /> {badge.text}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Background elements */}
                <div
                    className="absolute top-10 right-12 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"
                    style={{ opacity: 0.3 }}
                />
                <div
                    className="absolute bottom-0 right-36 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"
                    style={{ opacity: 0.2 }}
                />
            </div>

            {/* Search and Filters */}
            <div
                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                style={{ opacity: 1, transform: "translateY(0px)", transition: "opacity 0.5s, transform 0.5s" }}
            >
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-orange-500" />
                    <Input
                        type="search"
                        placeholder="Search challenges..."
                        className="w-full bg-gray-900/70 border-gray-700/50 pl-10 h-10 transition-all duration-200 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 bg-gray-900/70 border-gray-700/50 hover:bg-gray-800 hover:border-orange-500/50 transition-all">
                                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">All Difficulties</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Easy</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Medium</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Hard</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Expert</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 bg-gray-900/70 border-gray-700/50 hover:bg-gray-800 hover:border-orange-500/50 transition-all">
                                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Newest</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Oldest</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Most Popular</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">Highest Points</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Challenge Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge, index) => {
                    const difficultyColor = getDifficultyColor(challenge.difficulty);
                    const likesCount = challenge.likes?.filter((like) => like.isLike).length || 0;
                    const successfulAttempts = challenge.attempts?.filter((attempt) => attempt.successful).length || 0;
                    const CategoryIcon = getCategoryIcon(challenge.category?.name || "System Design");

                    return (
                        <div
                            key={challenge.id}
                            className="opacity-100 transform translate-y-0"
                            style={{
                                transition: "opacity 0.5s, transform 0.5s",
                                transitionDelay: `${0.2 + index * 0.1}s`
                            }}
                        >
                            <Link href={`/challenges/${challenge.id}`} className="block h-full">
                                <Card className="h-full relative bg-gray-900/70 border-gray-700/80 hover:border-orange-500/70 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden group">
                                    {/* Glowing effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 to-red-600/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                                    <CardHeader className={`pb-2 relative ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={`${difficultyColor} font-medium transition-all duration-300 group-hover:border-opacity-70`}>
                                                {challenge.difficulty}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                                                <Flame className="w-3 h-3 mr-1" /> {challenge.points} pts
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-orange-400 transition-colors duration-300 mt-2">
                                            {challenge.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1 text-gray-400">
                                            {challenge.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="bg-gray-800/70 text-gray-300 border-gray-700/50 group-hover:bg-gray-800 transition-all duration-300">
                                                <CategoryIcon className="w-3 h-3 mr-1 text-orange-400" />
                                                {challenge.category?.name || "System Design"}
                                            </Badge>
                                            {challenge.languages?.slice(0, 3).map((language) => (
                                                <Badge
                                                    key={language.id}
                                                    variant="outline"
                                                    className="bg-gray-800/70 text-gray-300 border-gray-700/50 group-hover:bg-gray-800 transition-all duration-300"
                                                >
                                                    {language.name}
                                                </Badge>
                                            ))}
                                            {challenge.languages?.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-gray-800/70 text-gray-300 border-gray-700/50"
                                                >
                                                    +{challenge.languages.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="border-t border-gray-800 pt-3 text-sm text-gray-400">
                                        <div className="flex justify-between w-full">
                                            <span className="flex items-center">
                                                <Flame className="w-4 h-4 mr-1 text-orange-500/70" />
                                                {likesCount} likes
                                            </span>
                                            <span className="flex items-center">
                                                <Server className="w-4 h-4 mr-1 text-emerald-500/70" />
                                                {successfulAttempts} solved
                                            </span>
                                        </div>
                                    </CardFooter>

                                    {/* Bottom border animation on hover */}
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 group-hover:w-full transition-all duration-500" />
                                </Card>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Empty state if no challenges */}
            {challenges.length === 0 && !loading && (
                <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    style={{ opacity: 1, transition: "opacity 0.5s", transitionDelay: "0.5s" }}
                >
                    <LayoutGrid className="w-16 h-16 text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No system design challenges available</h3>
                    <p className="text-gray-500 mt-2 max-w-md">
                        We're working on adding new system design challenges. Check back soon!
                    </p>
                </div>
            )}
        </div>
    );
}
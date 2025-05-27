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
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className={`flex items-center justify-center h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="text-red-500">Invalid challenge type</div>
            </div>
        );
    }

    const content = challengeTypeContent[type];
    const isDark = theme === 'dark';

    // Theme-aware styles
    const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
    const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-500';
    const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${bgColor}`}>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-48 mx-auto" />
                    <div className="flex space-x-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-8 w-24" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-8 p-4 sm:p-8 ${bgColor} ${textColor} min-h-screen`}>
            {/* Header Section */}
            <div className={`relative overflow-hidden rounded-xl p-6 sm:p-8 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-gradient-to-r from-orange-50 to-red-50'} border ${borderColor}`}>
                <div className="flex flex-col gap-4 z-10 relative">
                    <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight`}>
                        {content.gradientText} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Challenges</span>
                    </h1>
                    <p className={`${secondaryText} max-w-2xl text-lg`}>
                        {content.description}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                        {content.badges.map((badge, index) => (
                            <Badge
                                key={index}
                                className={`${isDark ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-200'} px-3 py-1`}
                            >
                                <badge.icon className="w-4 h-4 mr-1" /> {badge.text}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Background elements */}
                {isDark && (
                    <>
                        <div className="absolute top-10 right-12 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl opacity-30" />
                        <div className="absolute bottom-0 right-36 w-32 h-32 bg-red-600/10 rounded-full blur-2xl opacity-20" />
                    </>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96 group">
                    <Search className={`absolute left-3 top-3 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-orange-500`} />
                    <Input
                        type="search"
                        placeholder="Search challenges..."
                        className={`w-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} pl-10 h-10 transition-all duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30`}
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                className={`h-10 ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all`}
                            >
                                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className={`w-48 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                            {['All Difficulties', 'Easy', 'Medium', 'Hard', 'Expert'].map((item) => (
                                <DropdownMenuItem 
                                    key={item} 
                                    className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    {item}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                className={`h-10 ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all`}
                            >
                                <Filter className="mr-2 h-4 w-4 text-orange-500" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className={`w-48 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                            {['Newest', 'Oldest', 'Most Popular', 'Highest Points'].map((item) => (
                                <DropdownMenuItem 
                                    key={item} 
                                    className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    {item}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Challenge Cards Grid */}
            {challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge, index) => {
                        const difficultyColor = getDifficultyColor(challenge.difficulty);
                        const likesCount = challenge.likes?.filter((like) => like.isLike).length || 0;
                        const successfulAttempts = challenge.attempts?.filter((attempt) => attempt.successful).length || 0;
                        const CategoryIcon = getCategoryIcon(challenge.category?.name || "System Design");

                        return (
                            <Link 
                                key={challenge.id} 
                                href={`/challenge/${challenge.id}`}
                                className="group transition-transform hover:-translate-y-1"
                            >
                                <Card className={`h-full relative ${cardBg} ${borderColor} hover:border-orange-500/70 transition-all duration-300 overflow-hidden`}>
                                    {/* Glowing effect on hover */}
                                    {isDark && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 to-red-600/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                    )}

                                    <CardHeader className="pb-2 relative">
                                        <div className="flex justify-between items-start">
                                            <Badge 
                                                variant="outline" 
                                                className={`${difficultyColor} ${isDark ? 'group-hover:border-opacity-70' : ''} font-medium`}
                                            >
                                                {challenge.difficulty}
                                            </Badge>
                                            <Badge 
                                                variant="secondary" 
                                                className={`${isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-200'}`}
                                            >
                                                <Flame className="w-3 h-3 mr-1" /> {challenge.points} pts
                                            </Badge>
                                        </div>
                                        <CardTitle className={`text-xl group-hover:text-orange-500 transition-colors duration-300 mt-2 ${textColor}`}>
                                            {challenge.title}
                                        </CardTitle>
                                        <CardDescription className={`line-clamp-2 mt-1 ${secondaryText}`}>
                                            {challenge.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge 
                                                variant="outline" 
                                                className={`${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                            >
                                                <CategoryIcon className="w-3 h-3 mr-1 text-orange-400" />
                                                {challenge.category?.name || "System Design"}
                                            </Badge>
                                            {challenge.languages?.slice(0, 3).map((language) => (
                                                <Badge
                                                    key={language.id}
                                                    variant="outline"
                                                    className={`${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    {language.name}
                                                </Badge>
                                            ))}
                                            {challenge.languages?.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className={`${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    +{challenge.languages.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-3 text-sm ${secondaryText}`}>
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
                        );
                    })}
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center py-16 text-center ${cardBg} rounded-xl border ${borderColor}`}>
                    <content.emptyState.icon className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-400'}`} />
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {content.emptyState.title}
                    </h3>
                    <p className={`${secondaryText} mt-2 max-w-md`}>
                        {content.emptyState.description}
                    </p>
                    <Button 
                        className="mt-6 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => window.location.href = '/challenge'}
                    >
                        Explore Challenges
                    </Button>
                </div>
            )}
        </div>
    );
}
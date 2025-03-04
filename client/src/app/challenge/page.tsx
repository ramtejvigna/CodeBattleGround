"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, Filter, Clock, Award, BarChart2,
    ChevronRight, Star, ThumbsUp, Code, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChallengeListItem } from '@/lib/interfaces';
import { useTheme } from '@/context/ThemeContext';

// Mock data for challenges
const mockChallenges: ChallengeListItem[] = [
    {
        id: '1',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'EASY',
        points: 100,
        category: 'Algorithms',
        likes: 1245,
        submissions: 5432,
        successRate: 78,
        languages: ['JavaScript', 'Python', 'Java', 'C++'],
        createdAt: '2023-05-15T10:30:00Z',
    },
    {
        id: '2',
        title: 'Merge K Sorted Lists',
        description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        difficulty: 'HARD',
        points: 350,
        category: 'Data Structures',
        likes: 987,
        submissions: 3210,
        successRate: 45,
        languages: ['JavaScript', 'Python', 'Java', 'C++', 'Go'],
        createdAt: '2023-06-22T14:15:00Z',
    },
    {
        id: '3',
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'MEDIUM',
        points: 200,
        category: 'Algorithms',
        likes: 1876,
        submissions: 7654,
        successRate: 62,
        languages: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'],
        createdAt: '2023-04-10T09:45:00Z',
    },
    {
        id: '4',
        title: 'Design Twitter',
        description: 'Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and see the 10 most recent tweets in the user\'s news feed.',
        difficulty: 'EXPERT',
        points: 500,
        category: 'System Design',
        likes: 756,
        submissions: 1543,
        successRate: 32,
        languages: ['JavaScript', 'Python', 'Java'],
        createdAt: '2023-07-05T16:20:00Z',
    },
    {
        id: '5',
        title: 'LRU Cache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        difficulty: 'MEDIUM',
        points: 250,
        category: 'Data Structures',
        likes: 1432,
        submissions: 4321,
        successRate: 55,
        languages: ['JavaScript', 'Python', 'Java', 'C++', 'Go'],
        createdAt: '2023-05-30T11:10:00Z',
    },
    {
        id: '6',
        title: 'Binary Tree Maximum Path Sum',
        description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Find the maximum path sum.',
        difficulty: 'HARD',
        points: 400,
        category: 'Algorithms',
        likes: 1089,
        submissions: 2987,
        successRate: 41,
        languages: ['JavaScript', 'Python', 'Java', 'C++'],
        createdAt: '2023-06-15T13:25:00Z',
    },
];

// Type-safe difficulty colors mapping
const difficultyColors: Record<'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT', string> = {
    'EASY': 'bg-green-500/20 text-green-500',
    'MEDIUM': 'bg-yellow-500/20 text-yellow-500',
    'HARD': 'bg-red-500/20 text-red-500',
    'EXPERT': 'bg-purple-500/20 text-purple-500',
};

// Type for filter states
type DifficultyFilter = 'all' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
type CategoryFilter = 'all' | 'Algorithms' | 'Data Structures' | 'System Design';
type SortOption = 'newest' | 'oldest' | 'most-liked' | 'most-submissions' | 'highest-points';
type TabOption = 'all' | 'solved' | 'attempted' | 'bookmarked';

interface ChallengeStats {
    totalSolved: number;
    currentStreak: number;
    avgCompletionTime: string;
}

const ChallengesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredChallenges, setFilteredChallenges] = useState<ChallengeListItem[]>(mockChallenges);
    const [activeTab, setActiveTab] = useState<TabOption>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const { theme } = useTheme();
    
    // User stats - in a real app, this would come from an API
    const challengeStats: ChallengeStats = {
        totalSolved: 24,
        currentStreak: 7,
        avgCompletionTime: '32 min'
    };

    useEffect(() => {
        let result = [...mockChallenges];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(challenge =>
                challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply tab filter
        if (activeTab !== 'all') {
            // This would filter based on user's solved/attempted challenges in a real app
            // For now, just showing a subset for demonstration
            result = result.filter((_, index) => index % 2 === (activeTab === 'solved' ? 0 : 1));
        }

        // Apply difficulty filter
        if (difficultyFilter !== 'all') {
            result = result.filter(challenge => challenge.difficulty === difficultyFilter);
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            result = result.filter(challenge => challenge.category === categoryFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'most-liked':
                result.sort((a, b) => b.likes - a.likes);
                break;
            case 'most-submissions':
                result.sort((a, b) => b.submissions - a.submissions);
                break;
            case 'highest-points':
                result.sort((a, b) => b.points - a.points);
                break;
            default:
                break;
        }

        setFilteredChallenges(result);
    }, [searchQuery, activeTab, difficultyFilter, categoryFilter, sortBy]);

    return (
        <div className={`container ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : ''} py-8 px-4`}>
            <div className='max-w-7xl mx-auto'>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-tr from-[#F14A00] to-[#C62300] bg-clip-text text-transparent">
                        Coding Challenges
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Test your skills, solve problems, and climb the leaderboard
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                    <Button className="bg-gradient-to-tr from-[#F14A00] to-[#C62300] hover:from-[#C62300] hover:to-[#F14A00] gap-2">
                        <Zap className="h-4 w-4" />
                        Create Challenge
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar with filters */}
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            className={`w-full pl-10 pr-4 py-2 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : ''} bg-background border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Difficulty</h3>
                        <div className="space-y-1">
                            {(['all', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map((difficulty) => (
                                <div key={difficulty} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`difficulty-${difficulty}`}
                                        name="difficulty"
                                        checked={difficultyFilter === difficulty}
                                        onChange={() => setDifficultyFilter(difficulty)}
                                        className="mr-2 accent-orange-500"
                                    />
                                    <label htmlFor={`difficulty-${difficulty}`} className="text-sm">
                                        {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Category</h3>
                        <div className="space-y-1">
                            {(['all', 'Algorithms', 'Data Structures', 'System Design'] as const).map((category) => (
                                <div key={category} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`category-${category}`}
                                        name="category"
                                        checked={categoryFilter === category}
                                        onChange={() => setCategoryFilter(category)}
                                        className="mr-2 accent-orange-500"
                                    />
                                    <label htmlFor={`category-${category}`} className="text-sm">
                                        {category === 'all' ? 'All Categories' : category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Sort By</h3>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
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

                    <Card className='border-0 rounded-3xl'>
                        <CardHeader className={`pb-3 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : ''}`}>
                            <CardTitle className="text-lg">Challenge Stats</CardTitle>
                        </CardHeader>
                        <CardContent className={`space-y-4 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : ''}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm">Total Solved</span>
                                </div>
                                <span className="font-medium">{challengeStats.totalSolved}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm">Current Streak</span>
                                </div>
                                <span className="font-medium">{challengeStats.currentStreak} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm">Avg. Completion</span>
                                </div>
                                <span className="font-medium">{challengeStats.avgCompletionTime}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main content */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as TabOption)}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">All Challenges</TabsTrigger>
                            <TabsTrigger value="solved">Solved</TabsTrigger>
                            <TabsTrigger value="attempted">Attempted</TabsTrigger>
                            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="flex flex-col gap-4">
                            {filteredChallenges.length > 0 ? (
                                filteredChallenges.map((challenge) => (
                                    <Link href={`/challenge/${challenge.id}`} key={challenge.id}>
                                        <Card className={`hover:border-orange-500/50 transition-all cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : ''}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl group-hover:text-orange-500 flex items-center gap-2">
                                                            {challenge.title}
                                                            {challenge.difficulty === 'EXPERT' && (
                                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                            )}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                                                                {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                                                            </Badge>
                                                            <Badge variant="outline">{challenge.category}</Badge>
                                                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                                                {challenge.points} Points
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground line-clamp-2">
                                                    {challenge.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {challenge.languages.map((lang) => (
                                                        <Badge key={lang} variant="secondary" className="text-xs">
                                                            {lang}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                                                <div className="flex justify-between w-full">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <ThumbsUp className="h-3.5 w-3.5" />
                                                            <span>{challenge.likes}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Code className="h-3.5 w-3.5" />
                                                            <span>{challenge.submissions} submissions</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`${challenge.successRate > 60 ? 'text-green-500' : challenge.successRate > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                            {challenge.successRate}% success rate
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                        <Code className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">No challenges found</h3>
                                    <p className="text-muted-foreground mt-1">
                                        Try adjusting your filters or search query
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            </div>
        </div>
    );
};

export default ChallengesPage;
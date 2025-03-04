"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ChevronLeft, Clock, Award, ThumbsUp, ThumbsDown,
    Play, Save, Check, X, AlertCircle, Download, Upload,
    Loader2, Settings, Maximize, Minimize, Copy, Terminal
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Challenge, ChallengeCategory, TestCase, Language, User } from '@/lib/interfaces';

// Mock data for a single challenge
const mockChallenge: Challenge = {
    id: '1',
    title: 'Two Sum',
    description: `
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

Follow-up: Can you come up with an algorithm that is less than O(n²) time complexity?
  `,
    difficulty: 'EASY',
    points: 100,
    creatorId: '1',
    categoryId: '1',
    testCases: [
        {
            id: '1',
            challengeId: '1',
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            isHidden: false,
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
            id: '2',
            challengeId: '1',
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            isHidden: false,
        },
        {
            id: '3',
            challengeId: '1',
            input: 'nums = [3,3], target = 6',
            output: '[0,1]',
            isHidden: false,
        },
        {
            id: '4',
            challengeId: '1',
            input: 'nums = [1,2,3,4,5], target = 9',
            output: '[3,4]',
            isHidden: true,
        },
        {
            id: '5',
            challengeId: '1',
            input: 'nums = [-1,-2,-3,-4,-5], target = -8',
            output: '[2,4]',
            isHidden: true,
        },
    ],
    languages: [
        {
            id: 'javascript',
            name: 'JavaScript',
            starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-15T10:30:00Z'
        },
        {
            id: 'python',
            name: 'Python',
            starterCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-15T10:30:00Z'
        },
        {
            id: 'java',
            name: 'Java',
            starterCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-15T10:30:00Z'
        },
        {
            id: 'cpp',
            name: 'C++',
            starterCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-15T10:30:00Z'
        },
    ],
    timeLimit: 2000, // Time limit in seconds
    memoryLimit: 128, // Memory limit in MB
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z',
    category: {
        id: '1',
        name: 'Algorithms',
        description: 'Algorithm challenges',
    },
    creator: {
        id: '1',
        username: 'leetmaster',
        email: 'leetmaster@example.com',
        name: 'Leet Master',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3',
        emailVerified: null,
        githubConnected: false,
        createdAt: '2023-05-15T10:30:00Z',
        updatedAt: '2023-05-15T10:30:00Z',
    },
    submissions: [],
    attempts: [],
    likes: [],
};

// Mock submission results
const mockSubmissionResults = {
    status: 'ACCEPTED', // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.
    runtime: 76, // ms
    memory: 42.1, // MB
    testResults: [
        { id: '1', passed: true, runtime: 72, memory: 41.8 },
        { id: '2', passed: true, runtime: 74, memory: 42.0 },
        { id: '3', passed: true, runtime: 76, memory: 42.1 },
        { id: '4', passed: true, runtime: 75, memory: 42.0 },
        { id: '5', passed: true, runtime: 73, memory: 41.9 },
    ],
};

const difficultyColors: Record<'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT', string> = {
    'EASY': 'bg-green-500/20 text-green-500',
    'MEDIUM': 'bg-yellow-500/20 text-yellow-500',
    'HARD': 'bg-red-500/20 text-red-500',
    'EXPERT': 'bg-purple-500/20 text-purple-500',
};

const statusColors = {
    'ACCEPTED': 'text-green-500',
    'WRONG_ANSWER': 'text-red-500',
    'TIME_LIMIT_EXCEEDED': 'text-yellow-500',
    'MEMORY_LIMIT_EXCEEDED': 'text-yellow-500',
    'RUNTIME_ERROR': 'text-red-500',
    'COMPILATION_ERROR': 'text-red-500',
    'PENDING': 'text-blue-500',
};

const ChallengePage = () => {
    const params = useParams();

    const [challenge, setChallenge] = useState(mockChallenge);
    const [selectedLanguage, setSelectedLanguage] = useState(mockChallenge.languages[0].id);
    const [code, setCode] = useState(mockChallenge.languages[0].starterCode);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [submissionResults, setSubmissionResults] = useState<any>(null);
    const [runResults, setRunResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('description');

    // Change code when language changes
    useEffect(() => {
        const languageData = challenge.languages.find(lang => lang.id === selectedLanguage);
        if (languageData) {
            setCode(languageData.starterCode);
        }
    }, [selectedLanguage, challenge.languages]);

    // Simulate running code
    const handleRunCode = () => {
        setIsRunning(true);
        setRunResults(null);

        // Simulate API call delay
        setTimeout(() => {
            setIsRunning(false);
            // Only show results for visible test cases
            setRunResults({
                ...mockSubmissionResults,
                testResults: mockSubmissionResults.testResults
                    .filter((_, index) => challenge?.testCases?.[index]?.isHidden !== true)
            });
        }, 1500);
    };

    // Simulate submitting code
    const handleSubmitCode = () => {
        setIsSubmitting(true);
        setSubmissionResults(null);

        // Simulate API call delay
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmissionResults(mockSubmissionResults);
        }, 2000);
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`container mx-auto py-4 px-4 ${isFullscreen ? 'max-w-full' : 'max-w-7xl'}`}>
            {/* Header with navigation and challenge info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <Link href="/challenge" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Challenges
                    </Link>
                    <h1 className="text-2xl font-bold">{challenge.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                            {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                        </Badge>
                        <Badge variant="outline">{challenge.category?.name}</Badge>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                            {challenge.points} Points
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="text-green-500">
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Like this challenge</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="text-red-500">
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dislike this challenge</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="text-sm text-muted-foreground">
                        1245 likes • 123 dislikes
                    </div>
                </div>
            </div>

            {/* Main content with editor and description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left panel: Description, Examples, Solutions */}
                <div>
                    <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="examples">Examples</TabsTrigger>
                            <TabsTrigger value="discussion">Discussion</TabsTrigger>
                            <TabsTrigger value="solutions">Solutions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="space-y-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans">{challenge.description}</pre>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Challenge Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Time Limit</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                {challenge.timeLimit} ms
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Memory Limit</p>
                                            <p className="font-medium">{challenge.memoryLimit} MB</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Success Rate</p>
                                            <p className="font-medium">78%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Submissions</p>
                                            <p className="font-medium">5432</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created by</p>
                                            <p className="font-medium">{challenge.creator?.username}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="examples">
                            <Card>
                                <CardContent className="pt-6 space-y-6">
                                    {challenge.testCases
                                        ?.filter(testCase => !testCase.isHidden)
                                        .map((testCase, index) => (
                                            <div key={testCase.id} className="space-y-2">
                                                <h3 className="font-medium">Example {index + 1}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Input:</p>
                                                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{testCase.input}</pre>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Output:</p>
                                                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{testCase.output}</pre>
                                                    </div>
                                                </div>
                                                {testCase.explanation && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">Explanation:</p>
                                                        <p className="text-sm">{testCase.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="discussion">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <h3 className="text-lg font-medium">Discussion</h3>
                                        <p className="text-muted-foreground mt-1">
                                            Join the conversation about this challenge
                                        </p>
                                        <Button className="mt-4 bg-gradient-to-tr from-[#F14A00] to-[#C62300]">
                                            View Discussions
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="solutions">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <h3 className="text-lg font-medium">Community Solutions</h3>
                                        <p className="text-muted-foreground mt-1">
                                            View solutions from other users after you solve the challenge
                                        </p>
                                        <Button className="mt-4" variant="outline">
                                            Solve to Unlock
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right panel: Code Editor */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {challenge.languages.map(lang => (
                                    <SelectItem key={lang.id} value={lang.id}>{lang.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                                            {isFullscreen ? (
                                                <Minimize className="h-4 w-4" />
                                            ) : (
                                                <Maximize className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Editor Settings</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy Code</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted p-2 border-b flex justify-between items-center">
                            <span className="text-sm font-medium">Editor</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                        <div className="bg-background p-4 h-[400px] font-mono text-sm overflow-auto">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full bg-transparent resize-none focus:outline-none"
                                spellCheck="false"
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleRunCode}
                            disabled={isRunning || isSubmitting}
                        >
                            {isRunning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                            Run Code
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </Button>

                            <Button
                                className="gap-2 bg-gradient-to-tr from-[#F14A00] to-[#C62300]"
                                onClick={handleSubmitCode}
                                disabled={isRunning || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                Submit
                            </Button>
                        </div>
                    </div>

                    {/* Results panel */}
                    {(runResults || submissionResults) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {submissionResults ? 'Submission Results' : 'Run Results'}
                                    {submissionResults && submissionResults.status === 'ACCEPTED' && (
                                        <Check className="h-5 w-5 text-green-500" />
                                    )}
                                    {submissionResults && submissionResults.status !== 'ACCEPTED' && (
                                        <X className="h-5 w-5 text-red-500" />
                                    )}
                                </CardTitle>
                                {submissionResults && (
                                    <CardDescription>
                                        <span className={statusColors[submissionResults.status as keyof typeof statusColors]}>
                                            {submissionResults.status.replace(/_/g, ' ')}
                                        </span>
                                        {' • '}
                                        Runtime: {submissionResults.runtime} ms
                                        {' • '}
                                        Memory: {submissionResults.memory} MB
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-4">
                                        {(submissionResults?.testResults || runResults?.testResults)?.map((result: any, index: number) => {
                                            const testCase = challenge?.testCases?.[index];
                                            return (
                                                <div key={index} className="border rounded-md overflow-hidden">
                                                    <div className={`p-3 flex justify-between items-center ${result.passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                        <div className="flex items-center gap-2">
                                                            {result.passed ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="font-medium">
                                                                Test Case {index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {result.runtime} ms • {result.memory} MB
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-muted/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Input:</p>
                                                                <pre className="text-xs overflow-x-auto">{testCase?.input}</pre>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Expected Output:</p>
                                                                <pre className="text-xs overflow-x-auto">{testCase?.output}</pre>
                                                            </div>
                                                        </div>
                                                        {!result.passed && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-muted-foreground mb-1">Your Output:</p>
                                                                <pre className="text-xs overflow-x-auto text-red-500">[1, 3]</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}

                    {/* Terminal/Console */}
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                Console
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="bg-black text-green-400 font-mono text-xs p-3 h-[100px] overflow-auto">
                                {isRunning && (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Running code...</span>
                                    </div>
                                )}
                                {isSubmitting && (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Submitting solution...</span>
                                    </div>
                                )}
                                {runResults && (
                                    <>
                                        <div>$ node solution.js</div>
                                        <div className="text-white">
                                            {runResults.status === 'ACCEPTED'
                                                ? '✓ All test cases passed!'
                                                : '✗ Some test cases failed.'}
                                        </div>
                                        <div>
                                            Runtime: {runResults.runtime} ms | Memory: {runResults.memory} MB
                                        </div>
                                    </>
                                )}
                                {submissionResults && (
                                    <>
                                        <div>$ submit solution.js</div>
                                        <div className={submissionResults.status === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'}>
                                            {submissionResults.status.replace(/_/g, ' ')}
                                        </div>
                                        <div>
                                            Runtime: {submissionResults.runtime} ms | Memory: {submissionResults.memory} MB
                                        </div>
                                        {submissionResults.status === 'ACCEPTED' && (
                                            <div className="text-yellow-400">
                                                Congratulations! You've earned {challenge.points} points!
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChallengePage;
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import {
    Award,
    Clock,
    Cpu,
    CheckCircle,
    XCircle,
    Play,
    Save,
    RefreshCw,
    ThumbsUp,
    User,
    Eye,
    EyeOff,
} from "lucide-react"
import Loader from "@/components/Loader"
import CodeEditor from "@/components/CodeEditor"
import Link from "next/link"

// Types
interface TestCase {
    input: string
    output: string
    isHidden: boolean
    explanation?: string
}

interface Language {
    id: string
    name: string
}

interface Challenge {
    id: string
    title: string
    description: string
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT"
    points: number
    category: { name: string }
    testCases: TestCase[]
    starterCode: StarterCode
    handlerCode: StarterCode
    likes: number
    submissions: number
    timeLimit: number
    memoryLimit: number
    creator: {
        id: string
        username: string
        image?: string
    }
    submissionStats: {
        avgRuntime: number
        avgMemory: number
    }
}

interface TestResult {
    input: string
    expectedOutput: string
    actualOutput: string
    passed: boolean
}

interface StarterCode {
    [key: string]: string
}

const ChallengePage = () => {
    const { id } = useParams()
    const { theme } = useTheme()
    const { user } = useAuth()

    // State
    const [challenge, setChallenge] = useState<Challenge | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedLanguage, setSelectedLanguage] = useState<string>("JavaScript")
    const [code, setCode] = useState<string>("")
    const [languages, setLanguages] = useState<Language[]>([])
    const [testResults, setTestResults] = useState<TestResult[] | null>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null)
    const [runtime, setRuntime] = useState<number | null>(null)
    const [memory, setMemory] = useState<number | null>(null)
    const [showTestCases, setShowTestCases] = useState(true)

    // Fetch challenge data
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await fetch(`/api/challenges/${id}`);
                const data = await response.json();

                if (data.id) {
                    setChallenge(data);

                    // Set the initial code for the selected language
                    if (selectedLanguage && data.starterCode[selectedLanguage.toLowerCase()]) {
                        setCode(data.starterCode[selectedLanguage.toLowerCase()]);
                    }
                }
            } catch (error) {
                console.error("Error fetching challenge:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLanguages = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/languages`);
                const data = await response.json();
                setLanguages(data.languages);

                // Set the default selected language to the first language
                if (data.languages.length > 0) {
                    setSelectedLanguage(data.languages[0].name);
                }
            } catch (error) {
                console.error("Error fetching languages:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLanguages();
            fetchChallenge();
        }
    }, [id]);

    // Handle language change
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const langName = e.target.value;
        setSelectedLanguage(langName);

        // Update code with starter code for the selected language
        if (challenge && challenge.starterCode[langName.toLowerCase()]) {
            setCode(challenge.starterCode[langName.toLowerCase()]);
        }
    };

    // Run code
    const handleRunCode = async () => {
        if (!challenge || !selectedLanguage) return

        setIsRunning(true)
        setTestResults(null)
        setRuntime(null)
        setMemory(null)

        try {
            // const result = await runCodeLocally({
            //     challengeId: challenge.id,
            //     code,
            //     languageId: selectedLanguage,
            // })

            // if (result.success && result.testResults) {
            //     setTestResults(result.testResults)
            //     setRuntime(result.runtime)
            //     setMemory(result.memory)
            // } else {
            //     console.error("Error running code:", result.error)
            // }
            console.log("Code is running");
        } catch (error) {
            console.error("Error running code:", error)
        } finally {
            setIsRunning(false)
        }
    }

    // Submit solution
    const handleSubmitSolution = async () => {
        if (!challenge || !selectedLanguage || !user) return

        setIsSubmitting(true)
        setSubmissionStatus(null)

        try {
            // const result = await submitChallengeSolution({
            //     challengeId: challenge.id,
            //     userId: user.id,
            //     code,
            //     languageId: selectedLanguage,
            // })

            // if (result.success && result.status) {
            //     setSubmissionStatus(result.status)
            // } else {
            //     console.error("Error submitting solution:", result.error)
            // }

            console.log("Code is being submitted")
        } catch (error) {
            console.error("Error submitting solution:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Difficulty badge color
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY":
                return "bg-green-500"
            case "MEDIUM":
                return "bg-yellow-500"
            case "HARD":
                return "bg-orange-500"
            case "EXPERT":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        )
    }

    if (!challenge) {
        return (
            <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-white text-gray-800"}`}>
                <div className="container mx-auto px-4 py-16 text-center">
                    <XCircle size={64} className="mx-auto mb-4 text-red-500" />
                    <h1 className="text-3xl font-bold mb-4">Challenge Not Found</h1>
                    <p className="mb-8">The challenge you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/challenges"
                        className="inline-block bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-white py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Back to Challenges
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-white text-gray-800"}`}>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Challenge Details */}
                    <div className="lg:col-span-1">
                        <div
                            className={`rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                } shadow-sm overflow-hidden`}
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-2xl font-bold">{challenge.title}</h1>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(challenge.difficulty)}`}
                                    >
                                        {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-sm text-gray-500">Created by {challenge.creator.username}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-yellow-500" />
                                        <span className="text-sm">{challenge.points} Points</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp size={16} className="text-blue-500" />
                                        <span className="text-sm">{challenge.likes} Likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-orange-500" />
                                        <span className="text-sm">{challenge.timeLimit}s Time Limit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Cpu size={16} className="text-purple-500" />
                                        <span className="text-sm">{challenge.memoryLimit}MB Memory</span>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg mb-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <div dangerouslySetInnerHTML={{ __html: challenge.description }} />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">Test Cases</h3>
                                        <button
                                            onClick={() => setShowTestCases(!showTestCases)}
                                            className="text-sm flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            {showTestCases ? (
                                                <>
                                                    <EyeOff size={14} />
                                                    <span>Hide</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={14} />
                                                    <span>Show</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {showTestCases && (
                                        <div className={`space-y-3 ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
                                            {challenge.testCases
                                                .filter((tc) => !tc.isHidden)
                                                .map((testCase, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-3 rounded-lg text-sm ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                                                    >
                                                        <div className="mb-2">
                                                            <span className="font-medium">Input:</span>
                                                            <pre
                                                                className={`mt-1 p-2 rounded ${theme === "dark" ? "bg-gray-800" : "bg-white"
                                                                    } overflow-x-auto`}
                                                            >
                                                                {testCase.input}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Expected Output:</span>
                                                            <pre
                                                                className={`mt-1 p-2 rounded ${theme === "dark" ? "bg-gray-800" : "bg-white"
                                                                    } overflow-x-auto`}
                                                            >
                                                                {testCase.output}
                                                            </pre>
                                                        </div>
                                                        {testCase.explanation && (
                                                            <div className="mt-2 text-gray-500">
                                                                <span className="font-medium">Explanation:</span>
                                                                <p className="mt-1">{testCase.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            {challenge.testCases.some((tc) => tc.isHidden) && (
                                                <div
                                                    className={`p-3 rounded-lg text-sm ${theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <EyeOff size={14} />
                                                        <span>There are hidden test cases that will be used to evaluate your solution.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor and Results */}
                    <div className="lg:col-span-2">
                        <div
                            className={`rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                } shadow-sm overflow-hidden mb-6`}
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <select
                                        value={selectedLanguage}
                                        onChange={handleLanguageChange}
                                        className={`border rounded py-1 px-3 text-sm ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-gray-200"
                                            : "bg-white border-gray-300 text-gray-700"
                                            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.id} value={lang.name}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleRunCode}
                                        disabled={isRunning || !code}
                                        className={`flex items-center gap-1 py-1 px-3 rounded text-sm ${isRunning || !code ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                            } bg-green-600 text-white transition-opacity`}
                                    >
                                        {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                                        <span>Run Code</span>
                                    </button>

                                    <button
                                        onClick={handleSubmitSolution}
                                        disabled={isSubmitting || !code || !user}
                                        className={`flex items-center gap-1 py-1 px-3 rounded text-sm ${isSubmitting || !code || !user ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                            } bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-white transition-opacity`}
                                    >
                                        {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                        <span>Submit</span>
                                    </button>
                                </div>
                            </div>

                            <div className="h-[500px]">
                                <CodeEditor
                                    value={code}
                                    onChange={setCode}
                                    language={selectedLanguage.toLowerCase()}
                                    theme={theme === "dark" ? "vs-dark" : "vs"}
                                />
                            </div>
                        </div>

                        {/* Test Results */}
                        {testResults && (
                            <div
                                className={`rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                    } shadow-sm overflow-hidden mb-6`}
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold">Test Results</h3>
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-blue-500" />
                                                <span className="text-sm">Runtime: {runtime}ms</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Cpu size={16} className="text-purple-500" />
                                                <span className="text-sm">Memory: {memory}KB</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${testResults.every((r) => r.passed)
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                    }`}
                                            >
                                                {testResults.every((r) => r.passed) ? "All Tests Passed" : "Some Tests Failed"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {testResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg border ${result.passed
                                                    ? theme === "dark"
                                                        ? "border-green-700 bg-green-900/20"
                                                        : "border-green-200 bg-green-50"
                                                    : theme === "dark"
                                                        ? "border-red-700 bg-red-900/20"
                                                        : "border-red-200 bg-red-50"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium">Test Case #{index + 1}</span>
                                                    {result.passed ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <CheckCircle size={16} />
                                                            <span>Passed</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <XCircle size={16} />
                                                            <span>Failed</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="font-medium mb-1">Input:</div>
                                                        <pre
                                                            className={`p-2 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                                                                } overflow-x-auto`}
                                                        >
                                                            {result.input}
                                                        </pre>
                                                    </div>

                                                    <div>
                                                        <div className="font-medium mb-1">Expected Output:</div>
                                                        <pre
                                                            className={`p-2 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                                                                } overflow-x-auto`}
                                                        >
                                                            {result.expectedOutput}
                                                        </pre>

                                                        {!result.passed && (
                                                            <div className="mt-2">
                                                                <div className="font-medium mb-1 text-red-600 dark:text-red-400">Your Output:</div>
                                                                <pre
                                                                    className={`p-2 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                                                                        } overflow-x-auto`}
                                                                >
                                                                    {result.actualOutput}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submission Status */}
                        {submissionStatus && (
                            <div
                                className={`rounded-lg border ${submissionStatus === "ACCEPTED"
                                    ? theme === "dark"
                                        ? "bg-green-900/20 border-green-700"
                                        : "bg-green-50 border-green-200"
                                    : theme === "dark"
                                        ? "bg-red-900/20 border-red-700"
                                        : "bg-red-50 border-red-200"
                                    } p-4 mb-6`}
                            >
                                <div className="flex items-center gap-2">
                                    {submissionStatus === "ACCEPTED" ? (
                                        <>
                                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                            <div>
                                                <h3 className="font-semibold text-green-600 dark:text-green-400">Solution Accepted!</h3>
                                                <p className="text-sm">Congratulations! Your solution passed all test cases.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                            <div>
                                                <h3 className="font-semibold text-red-600 dark:text-red-400">Solution Failed</h3>
                                                <p className="text-sm">Your solution did not pass all test cases. Please try again.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChallengePage


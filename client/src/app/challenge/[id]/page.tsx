"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import { useProfileStore } from "@/lib/store/profileStore"
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
import toast from "react-hot-toast"

// Types
interface TestCase {
  id: string
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
  runtime?: number
  memory?: number
}

const ChallengePage = () => {
  const { id } = useParams()
  const { theme } = useTheme()

  const { userData } = useProfileStore();

  // State
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<string>()
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
        const response = await fetch(`/api/challenges/${id}`)
        const data = await response.json()

        if (data.id) {
          setChallenge(data)
        }
      } catch (error) {
        console.error("Error fetching challenge:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchLanguages = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/languages`)
        const data = await response.json()
        setLanguages(data.languages)

        // Set the default selected language to the first language
        if (data.languages.length > 0) {
          setSelectedLanguage(data.languages[0].name)
        }
      } catch (error) {
        console.error("Error fetching languages:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchLanguages()
      fetchChallenge()
    }
  }, [id])

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langName = e.target.value
    setSelectedLanguage(langName)

    // Reset code when changing languages
    setCode("")
  }

  // Run code
  const handleRunCode = async () => {
    if (!challenge || !selectedLanguage) return

    setIsRunning(true)
    setTestResults(null)
    setRuntime(null)
    setMemory(null)

    try {
      const testCase = challenge.testCases.find((tc) => !tc.isHidden)
      if (!testCase) {
        toast.error("No test cases available to run")
        return
      }

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          challengeId: challenge.id,
          testCaseId: testCase.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run code")
      }

      setTestResults(data.testResults)
      setRuntime(data.runtime)
      setMemory(data.memory)
    } catch (error) {
      console.error("Error running code:", error)
      toast.error("Failed to run code")
    } finally {
      setIsRunning(false)
    }
  }

  // Submit solution
  const handleSubmitSolution = async () => {
    if (!challenge || !selectedLanguage || !userData) return

    setIsSubmitting(true)
    setSubmissionStatus(null)

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          challengeId: challenge.id,
          isSubmission: true,
          userId: userData.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit solution")
      }

      setTestResults(data.testResults)
      setRuntime(data.runtime)
      setMemory(data.memory)
      setSubmissionStatus(data.allPassed ? "ACCEPTED" : "FAILED")

      if (data.allPassed) {
        toast.success("Solution accepted! All test cases passed.")
      } else {
        toast.error("Solution failed. Some test cases did not pass.")
      }
    } catch (error) {
      console.error("Error submitting solution:", error)
      toast.error("Failed to submit solution")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-500 text-white"
      case "MEDIUM":
        return "bg-yellow-500 text-white"
      case "HARD":
        return "bg-orange-500 text-white"
      case "EXPERT":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Get language-specific template code
  const getLanguageTemplate = (language: string) => {
    // Provide basic templates for common languages
    switch (language.toLowerCase()) {
      case "javascript":
        return `// Write your JavaScript solution here
// Example:
function solution(input) {
  // Your code here
  return output;
}`
      case "python":
        return `# Write your Python solution here
# Example:
def solution(input):
    # Your code here
    return output`
      case "java":
        return `// Write your Java solution here
// Example:
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`
      case "c++":
      case "cpp":
        return `// Write your C++ solution here
// Example:
#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
      default:
        return `// Write your solution here`
    }
  }

  // Set template code when language changes
  useEffect(() => {
    if (selectedLanguage && code === "") {
      setCode(getLanguageTemplate(selectedLanguage))
    }
  }, [selectedLanguage, code])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <div className="container mx-auto px-4 py-16 text-center">
          <XCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className={`text-3xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Challenge Not Found
          </h1>
          <p className={`mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            The challenge you're looking for doesn't exist or has been removed.
          </p>
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
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Details */}
          <div className="lg:col-span-1">
            <div
              className={`rounded-lg border ${
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              } shadow-sm overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {challenge.title}
                  </h1>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Created by {challenge.creator.username}
                    </span>
                  </div>
                  
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}
                  >
                    {challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-yellow-500" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {challenge.points} Points
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp size={16} className="text-blue-500" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {challenge.likes} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-500" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {challenge.timeLimit}s Time Limit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-purple-500" />
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {challenge.memoryLimit}MB Memory
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg mb-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                  <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Description
                  </h3>
                  <div className={`prose prose-sm max-w-none ${theme === "dark" ? "prose-invert text-gray-300" : "text-gray-700"}`}>
                    <div dangerouslySetInnerHTML={{ __html: challenge.description }} />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                      Test Cases
                    </h3>
                    <button
                      onClick={() => setShowTestCases(!showTestCases)}
                      className={`text-sm flex items-center gap-1 ${
                        theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                      }`}
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
                    <div className="space-y-3">
                      {challenge.testCases
                        .filter((tc) => !tc.isHidden)
                        .map((testCase, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg text-sm ${
                              theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="mb-2">
                              <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Input:
                              </span>
                              <pre
                                className={`mt-1 p-2 rounded ${
                                  theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
                                } overflow-x-auto`}
                              >
                                {testCase.input}
                              </pre>
                            </div>
                            <div>
                              <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Expected Output:
                              </span>
                              <pre
                                className={`mt-1 p-2 rounded ${
                                  theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
                                } overflow-x-auto`}
                              >
                                {testCase.output}
                              </pre>
                            </div>
                            {testCase.explanation && (
                              <div className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                <span className="font-medium">Explanation:</span>
                                <p className="mt-1">{testCase.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      {challenge.testCases.some((tc) => tc.isHidden) && (
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
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
              className={`rounded-lg border ${
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              } shadow-sm overflow-hidden mb-6`}
            >
              <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"} flex justify-between items-center`}>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className={`border rounded py-1 px-3 text-sm ${
                      theme === "dark"
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
                    className={`flex items-center gap-1 py-1 px-3 rounded text-sm ${
                      isRunning || !code ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    } bg-green-600 text-white transition-opacity`}
                  >
                    {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    <span>Run Code</span>
                  </button>

                  <button
                    onClick={handleSubmitSolution}
                    disabled={isSubmitting || !code || !userData}
                    className={`flex items-center gap-1 py-1 px-3 rounded text-sm ${
                      isSubmitting || !code || !userData ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
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
                  language={selectedLanguage?.toLowerCase()}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              </div>
            </div>

            {/* Test Results */}
            {testResults && (
              <div
                className={`rounded-lg border ${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                } shadow-sm overflow-hidden mb-6`}
              >
                <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Test Results</h3>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          Runtime: {runtime}ms
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-purple-500" />
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          Memory: {memory}KB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          testResults.every((r) => r.passed)
                            ? theme === "dark"
                              ? "bg-green-900 text-green-300"
                              : "bg-green-100 text-green-800"
                            : theme === "dark"
                              ? "bg-red-900 text-red-300"
                              : "bg-red-100 text-red-800"
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
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? theme === "dark"
                              ? "border-green-700 bg-green-900/20"
                              : "border-green-200 bg-green-50"
                            : theme === "dark"
                              ? "border-red-700 bg-red-900/20"
                              : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                            Test Case #{index + 1}
                          </span>
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
                            <div className={`font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                              Input:
                            </div>
                            <pre
                              className={`mt-1 p-2 rounded ${
                                theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                              } overflow-x-auto`}
                            >
                              {result.input}
                            </pre>
                          </div>

                          <div>
                            <div className={`font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                              Expected Output:
                            </div>
                            <pre
                              className={`mt-1 p-2 rounded ${
                                theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                              } overflow-x-auto`}
                            >
                              {result.expectedOutput}
                            </pre>

                            {!result.passed && (
                              <div className="mt-2">
                                <div className={`font-medium mb-1 ${
                                  theme === "dark" ? "text-red-400" : "text-red-600"
                                }`}>
                                  Your Output:
                                </div>
                                <pre
                                  className={`p-2 rounded ${
                                    theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
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
                className={`rounded-lg border p-4 mb-6 ${
                  submissionStatus === "ACCEPTED"
                    ? theme === "dark"
                      ? "bg-green-900/20 border-green-700"
                      : "bg-green-50 border-green-200"
                    : theme === "dark"
                      ? "bg-red-900/20 border-red-700"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {submissionStatus === "ACCEPTED" ? (
                    <>
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                      <div>
                        <h3 className={`font-semibold ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}>
                          Solution Accepted!
                        </h3>
                        <p className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Congratulations! Your solution passed all test cases.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-red-600 dark:text-red-400" />
                      <div>
                        <h3 className={`font-semibold ${
                          theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}>
                          Solution Failed
                        </h3>
                        <p className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Your solution did not pass all test cases. Please try again.
                        </p>
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
"use client";;
import { useState, useEffect } from 'react';
import {
    Clock,
    Check,
    Play,
    Save,
    Settings,
    Users,
    MessageSquare,
    ChevronRight,
    Award,
    Zap,
} from 'lucide-react';

const ChallengeInterface = () => {
    const [activeTab, setActiveTab] = useState('description');
    const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
    const [isSolved, setIsSolved] = useState(false);
    const [testsPassed, setTestsPassed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [code, setCode] = useState(`function findOptimalPath(grid) {
  // Your solution here
  
}`);

    // Format time as HH:MM:SS
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const testCases = [
        { input: "[[0,0,0],[1,1,0],[0,0,0]]", expected: "[0,0] → [0,1] → [0,2] → [1,2] → [2,2]", passed: true },
        { input: "[[0,1,0],[0,1,0],[0,0,0]]", expected: "[0,0] → [1,0] → [2,0] → [2,1] → [2,2]", passed: false },
        { input: "[[0,0,0],[0,1,1],[0,0,0]]", expected: "[0,0] → [0,1] → [0,2] → [1,0] → [2,0] → [2,1] → [2,2]", passed: false }
    ];

    const runTests = () => {
        // Simulate running tests
        setTestsPassed(1);
        setTimeout(() => {
            setTestsPassed(2);
        }, 800);
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200 flex flex-col">
            {/* Challenge header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center">
                            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
                                Path Finding Challenge
                            </span>
                            <span className="ml-3 text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                                Medium
                            </span>
                        </h1>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                            <span className="flex items-center mr-4">
                                <Users className="w-3 h-3 mr-1" /> 346 participants
                            </span>
                            <span className="flex items-center">
                                <Award className="w-3 h-3 mr-1" /> 100 points
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center py-1 px-3 rounded-lg ${timeLeft < 1800 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50'
                            }`}>
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="font-mono">{formatTime(timeLeft)}</span>
                        </div>

                        <button
                            onClick={() => runTests()}
                            className="px-4 py-1 bg-green-600 hover:bg-green-500 transition-colors rounded-lg text-sm font-medium flex items-center"
                        >
                            <Play className="w-4 h-4 mr-1" /> Run Tests
                        </button>

                        <button className="px-4 py-1 bg-orange-600 hover:bg-orange-500 transition-colors rounded-lg text-sm font-medium flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Submit
                        </button>
                    </div>
                </div>
            </div>

            {/* Main challenge area */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 mx-auto w-full">
                {/* Left side: Description and tabs */}
                <div className="border-r border-gray-700">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 bg-gray-800/30">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'description'
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'tests'
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Test Cases
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'leaderboard'
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Leaderboard
                        </button>
                        <button
                            onClick={() => setActiveTab('discussions')}
                            className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'discussions'
                                ? 'border-b-2 border-orange-500 text-orange-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Discussions <span className="ml-1 bg-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">4</span>
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="p-6 overflow-y-auto h-[calc(100vh-12rem)]">
                        {activeTab === 'description' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Optimal Path Finder</h2>

                                <div className="text-gray-300 space-y-4">
                                    <p>
                                        Given a grid with obstacles, find the shortest path from the top-left corner (0,0) to the bottom-right corner.
                                        You can move in four directions: up, down, left, right. A cell with value 1 represents an obstacle, and 0 represents a free cell.
                                    </p>

                                    <h3 className="text-lg font-semibold mt-4">Input Format:</h3>
                                    <p>
                                        A 2D array where each cell contains either 0 (free) or 1 (obstacle).
                                    </p>

                                    <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm my-4">
                                        <p>Example input:</p>
                                        <pre>[[0,0,0],
                                            [1,1,0],
                                            [0,0,0]]</pre>
                                    </div>

                                    <h3 className="text-lg font-semibold">Output Format:</h3>
                                    <p>
                                        Return an array of coordinates representing the shortest path from (0,0) to the bottom-right corner.
                                        If no path exists, return an empty array.
                                    </p>

                                    <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm my-4">
                                        <p>Example output:</p>
                                        <pre>[[0,0], [0,1], [0,2], [1,2], [2,2]]</pre>
                                    </div>

                                    <h3 className="text-lg font-semibold">Constraints:</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Grid size will be between 1x1 and 100x100</li>
                                        <li>The grid will always have a start (0,0) and end (bottom-right)</li>
                                        <li>Optimize for both correctness and efficiency</li>
                                    </ul>

                                    {!showHint && (
                                        <button
                                            onClick={() => setShowHint(true)}
                                            className="text-orange-500 hover:text-orange-400 text-sm mt-4 flex items-center"
                                        >
                                            Show Hint <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}

                                    {showHint && (
                                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                                            <h4 className="text-orange-400 font-semibold flex items-center">
                                                <Zap className="w-4 h-4 mr-1" /> Hint
                                            </h4>
                                            <p className="text-gray-300 text-sm mt-2">
                                                Consider using Breadth-First Search (BFS) to find the shortest path. BFS guarantees the shortest path
                                                in an unweighted graph, which is what our grid represents.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tests' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Test Cases</h2>

                                <div className="space-y-4">
                                    {testCases.map((test, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border ${index < testsPassed
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-gray-800 border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold">Test Case {index + 1}</h3>
                                                {index < testsPassed && (
                                                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                                                        <Check className="w-3 h-3 mr-1" /> Passed
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Input:</p>
                                                    <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">{test.input}</pre>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Expected:</p>
                                                    <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">{test.expected}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'leaderboard' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-700/50">
                                            <tr>
                                                <th className="py-2 px-4 text-left">Rank</th>
                                                <th className="py-2 px-4 text-left">User</th>
                                                <th className="py-2 px-4 text-left">Runtime</th>
                                                <th className="py-2 px-4 text-left">Memory</th>
                                                <th className="py-2 px-4 text-left">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { rank: 1, user: "AlgoNinja", runtime: "56ms", memory: "39.8MB", time: "20m ago" },
                                                { rank: 2, user: "CodeMaster", runtime: "62ms", memory: "40.2MB", time: "1h ago" },
                                                { rank: 3, user: "PathFinder", runtime: "68ms", memory: "38.5MB", time: "2h ago" },
                                                { rank: 4, user: "ByteWarrior", runtime: "72ms", memory: "41.3MB", time: "3h ago" },
                                                { rank: 5, user: "DevDestroyer", runtime: "79ms", memory: "40.1MB", time: "5h ago" }
                                            ].map((entry, index) => (
                                                <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                                                    <td className="py-2 px-4 font-mono">{entry.rank}</td>
                                                    <td className="py-2 px-4 font-medium">{entry.user}</td>
                                                    <td className="py-2 px-4 text-green-400 font-mono">{entry.runtime}</td>
                                                    <td className="py-2 px-4 font-mono">{entry.memory}</td>
                                                    <td className="py-2 px-4 text-gray-400 text-sm">{entry.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'discussions' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Discussions</h2>

                                <div className="space-y-4">
                                    {[
                                        { user: "AlgoNinja", avatar: "AN", time: "2h ago", message: "Has anyone tried using a bidirectional BFS approach? It seems to be more efficient for larger grids.", likes: 12, replies: 2 },
                                        { user: "PathFinder", avatar: "PF", time: "5h ago", message: "I'm getting a timeout on test case 15. Any tips for optimizing the search algorithm?", likes: 8, replies: 3 },
                                        { user: "CodeMaster", avatar: "CM", time: "1d ago", message: "Don't forget to use a visited set to avoid cycles in your search! Cost me 30 minutes of debugging.", likes: 24, replies: 5 },
                                        { user: "NewCoder", avatar: "NC", time: "2d ago", message: "Is anyone else having trouble with the edge case where the start or end point is blocked?", likes: 6, replies: 1 }
                                    ].map((discussion, index) => (
                                        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                                            <div className="flex items-start">
                                                <div className="bg-gradient-to-tr from-orange-600 to-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {discussion.avatar}
                                                </div>
                                                <div className="ml-3 flex-grow">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-medium">{discussion.user}</h3>
                                                        <span className="text-xs text-gray-400">{discussion.time}</span>
                                                    </div>
                                                    <p className="text-gray-300 mt-2 text-sm">{discussion.message}</p>
                                                    <div className="flex items-center mt-3 text-gray-400 text-xs">
                                                        <button className="flex items-center hover:text-orange-500 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                            </svg>
                                                            {discussion.likes} likes
                                                        </button>
                                                        <span className="mx-2">•</span>
                                                        <button className="flex items-center hover:text-orange-500 transition-colors">
                                                            <MessageSquare className="w-4 h-4 mr-1" />
                                                            {discussion.replies} replies
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-400 mb-3">Add to the discussion</h3>
                                    <textarea
                                        placeholder="Share your thoughts, questions, or insights..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 min-h-[100px]"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button className="px-4 py-1 bg-orange-600 hover:bg-orange-500 transition-colors rounded-lg text-sm font-medium">
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Code editor */}
                <div className="flex flex-col overflow-auto">
                    {/* Editor header */}
                    <div className="bg-gray-800/30 border-b border-gray-700 p-3 flex justify-between items-center">
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300">
                                JavaScript
                            </button>
                            <button className="px-3 py-1 text-xs font-medium hover:bg-gray-700 rounded-md transition-colors text-gray-300">
                                Python
                            </button>
                            <button className="px-3 py-1 text-xs font-medium hover:bg-gray-700 rounded-md transition-colors text-gray-300">
                                Java
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                            <button
                                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                                onClick={() => {
                                    // Save code logic
                                    alert('Code saved!');
                                }}
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Code editor area */}
                    <div className="flex-grow relative overflow-hidden font-mono">
                        {/* Line numbers */}
                        <div className="absolute top-0 left-0 bottom-0 w-10 bg-gray-800/50 border-r border-gray-700 flex flex-col items-end pt-4 text-xs text-gray-500 select-none">
                            {Array.from({ length: 20 }, (_, i) => (
                                <div key={i} className="pr-2 h-6">
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Editable code area */}
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="absolute top-0 left-10 right-0 bottom-0 bg-gray-900 text-gray-300 p-4 resize-none outline-none text-sm font-mono tab-size-4 w-[calc(100%-2.5rem)]"
                            spellCheck="false"
                        />
                    </div>

                    {/* Results panel */}
                    <div className="h-64 border-t border-gray-700 bg-gray-800/30 overflow-hidden flex flex-col">
                        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                            <div className="flex space-x-2">
                                <button
                                    className="text-xs font-medium border-b-2 border-orange-500 text-orange-500 px-2 py-1"
                                >
                                    Console
                                </button>
                                <button
                                    className="text-xs font-medium text-gray-400 hover:text-gray-300 px-2 py-1"
                                >
                                    Test Results
                                </button>
                            </div>

                            <div className="flex items-center">
                                <span className={`w-2 h-2 rounded-full ${testsPassed > 0 ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></span>
                                <span className="text-xs font-medium">
                                    {testsPassed}/3 tests passed
                                </span>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 text-sm font-mono">
                            {testsPassed > 0 ? (
                                <div>
                                    <div className="text-green-400 flex items-start mb-2">
                                        <Check className="w-4 h-4 mr-2 mt-0.5" />
                                        <div>
                                            <span className="font-bold">Test 1 Passed</span>
                                            <div className="text-gray-400 text-xs mt-1">
                                                Path found: [0,0] → [0,1] → [0,2] → [1,2] → [2,2]
                                            </div>
                                        </div>
                                    </div>

                                    {testsPassed > 1 && (
                                        <div className="text-green-400 flex items-start">
                                            <Check className="w-4 h-4 mr-2 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Test 2 Passed</span>
                                                <div className="text-gray-400 text-xs mt-1">
                                                    Path found: [0,0] → [1,0] → [2,0] → [2,1] → [2,2]
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {testsPassed < 3 && (
                                        <div className="text-gray-400 mt-2">
                                            Waiting for test 3...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-400">
                                    Run tests to see results
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ChallengeInterface;
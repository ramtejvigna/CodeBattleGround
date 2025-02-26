"use client";

import { useState } from 'react';
import {
    Trophy,
    Code,
    Zap,
    Star,
    Calendar,
    Award,
    ChevronRight,
    Github,
    CheckCircle,
    Coffee,
    Settings,
    MessageSquare,
} from 'lucide-react';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock user data
    const userData = {
        username: "CodeNinja",
        joined: "May 2023",
        rank: 42,
        level: 16,
        solved: 387,
        streakDays: 28,
        points: 12560,
        bio: "Full-stack developer passionate about algorithms and competitive programming. Working on improving my graph theory skills.",
        languages: [
            { name: "JavaScript", percentage: 65 },
            { name: "Python", percentage: 25 },
            { name: "Java", percentage: 10 }
        ],
        badges: [
            { name: "100 Days Streak", icon: <Calendar className="w-4 h-4" />, description: "Maintained a 100-day coding streak" },
            { name: "Algorithm Master", icon: <Code className="w-4 h-4" />, description: "Solved 50 algorithm challenges" },
            { name: "Speed Demon", icon: <Zap className="w-4 h-4" />, description: "Completed a hard challenge in under 10 minutes" },
            { name: "Top Contributor", icon: <Star className="w-4 h-4" />, description: "Among top 1% of discussion contributors" }
        ],
        recentActivity: [
            { type: "challenge", name: "Binary Tree Traversal", result: "Solved", time: "2h ago", points: 75 },
            { type: "contest", name: "Weekly Challenge #42", result: "Ranked #8", time: "2d ago", points: 120 },
            { type: "badge", name: "Earned Graph Theory Specialist", result: "Achievement", time: "3d ago", points: 50 },
            { type: "challenge", name: "Dynamic Programming Challenge", result: "Solved", time: "5d ago", points: 90 }
        ]
    };

    // Mock statistics for the progress chart
    // const monthlyProgress = [
    //     { month: "Jan", challenges: 32, points: 1250 },
    //     { month: "Feb", challenges: 28, points: 1100 },
    //     { month: "Mar", challenges: 35, points: 1380 },
    //     { month: "Apr", challenges: 42, points: 1640 },
    //     { month: "May", challenges: 38, points: 1450 },
    //     { month: "Jun", challenges: 45, points: 1720 }
    // ];

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            {/* Profile header */}
            <div className="bg-gray-800/50 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar and name */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white">
                                {userData.username.charAt(0)}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">{userData.username}</h1>
                                <div className="flex items-center text-gray-400 text-sm mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Joined {userData.joined}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 md:gap-8 md:ml-auto">
                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Global Rank</div>
                                <div className="flex items-center mt-1">
                                    <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                                    <span className="text-xl font-bold">#{userData.rank}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Level</div>
                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-blue-500 mr-2" />
                                    <span className="text-xl font-bold">{userData.level}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Problems</div>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    <span className="text-xl font-bold">{userData.solved}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Streak</div>
                                <div className="flex items-center mt-1">
                                    <Coffee className="w-4 h-4 text-orange-500 mr-2" />
                                    <span className="text-xl font-bold">{userData.streakDays} days</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 ml-auto mt-2 md:mt-0">
                            <button className="p-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="border-b border-gray-700 bg-gray-800/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex overflow-x-auto hide-scrollbar">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'overview'
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'submissions'
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Submissions
                        </button>
                        <button
                            onClick={() => setActiveTab('badges')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'badges'
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Badges
                        </button>
                        <button
                            onClick={() => setActiveTab('contests')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'contests'
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Contests
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'statistics'
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Statistics
                        </button>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Bio */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-lg font-bold mb-4">About</h2>
                                <p className="text-gray-300">{userData.bio}</p>

                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Preferred Languages</h3>
                                    <div className="space-y-3">
                                        {userData.languages.map((lang, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{lang.name}</span>
                                                    <span className="text-gray-400">{lang.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                                                        style={{ width: `${lang.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent activity */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Recent Activity</h2>
                                    <button className="text-orange-500 text-sm flex items-center hover:text-orange-400 transition-colors">
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {userData.recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-start p-3 rounded-lg hover:bg-gray-750 transition-colors">
                                            <div className={`p-2 rounded-lg mr-3 ${activity.type === 'challenge' ? 'bg-blue-500/20 text-blue-400' :
                                                    activity.type === 'contest' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}>
                                                {activity.type === 'challenge' ? <Code className="w-5 h-5" /> :
                                                    activity.type === 'contest' ? <Trophy className="w-5 h-5" /> :
                                                        <Award className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{activity.name}</h3>
                                                        <div className="text-sm text-gray-400 mt-1">{activity.result}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-orange-500 font-medium">+{activity.points}</div>
                                                        <div className="text-sm text-gray-400 mt-1">{activity.time}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-8">
                            {/* Points summary */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-lg font-bold mb-4">Points Summary</h2>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-500">{userData.points.toLocaleString()}</div>
                                    <div className="text-gray-400 mt-1">Total Points</div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Code className="text-blue-400" />
                                        </div>
                                        <div className="font-bold">8,240</div>
                                        <div className="text-xs text-gray-400 mt-1">From Challenges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Trophy className="text-purple-400" />
                                        </div>
                                        <div className="font-bold">3,750</div>
                                        <div className="text-xs text-gray-400 mt-1">From Contests</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Award className="text-green-400" />
                                        </div>
                                        <div className="font-bold">570</div>
                                        <div className="text-xs text-gray-400 mt-1">From Badges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <MessageSquare className="text-yellow-400" />
                                        </div>
                                        <div className="font-bold">154</div>
                                        <div className="text-xs text-gray-400 mt-1">From Discussions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured badges */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Badges</h2>
                                    <button className="text-orange-500 text-sm flex items-center hover:text-orange-400 transition-colors">
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {userData.badges.slice(0, 4).map((badge, i) => (
                                        <div key={i} className="bg-gray-750 rounded-lg p-3 flex flex-col items-center text-center group hover:bg-gray-700 transition-colors cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2 text-orange-500 group-hover:scale-110 transition-transform">
                                                {badge.icon}
                                            </div>
                                            <div className="font-medium text-sm">{badge.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* GitHub integration */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 border-dashed">
                                <div className="flex items-center">
                                    <Github className="w-6 h-6 mr-3 text-gray-400" />
                                    <h2 className="text-lg font-bold">GitHub Integration</h2>
                                </div>
                                <p className="text-gray-400 mt-3 text-sm">
                                    Connect your GitHub account to showcase your projects and track your coding activity.
                                </p>
                                <button className="w-full mt-4 px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-750 transition-colors">
                                    Connect GitHub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Badges & Achievements</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...userData.badges, ...userData.badges].map((badge, i) => (
                                <div key={i} className="bg-gray-750 rounded-lg p-4 flex flex-col items-center text-center group hover:border hover:border-orange-500 transition-all cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-3 text-orange-500 group-hover:scale-110 transition-transform">
                                        {badge.icon}
                                    </div>
                                    <div className="font-medium">{badge.name}</div>
                                    <div className="text-gray-400 text-sm mt-2">{badge.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
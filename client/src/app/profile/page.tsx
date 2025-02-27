"use client";

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Badge {
    iconType: 'calendar' | 'code' | 'zap' | 'star' | 'award';
    name: string;
    description?: string;
    points?: number;
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    )
}

interface User {
    id: string,
    username: string,
    name: string,
    email: string,
    image?: string | null,
    createdAt?: Date,
    userProfile?: {
        id: string,
        bio: string,
        rank: number,
        languages: [{ name: string; percentage: number }],
        preferredLanguage: string,
        level: number,
        points: number, 
        solved: number,
        streakDays: number,
        badges: [Badge],
        createdAt: Date,
        updatedAt: Date
    }
}

const ProfileContent = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    if (!user) return null;

    // Fetch user profile data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                const response = await fetch(`/api/profile?id=${user.id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })

                const data = await response.json();

                setUserData(data.user);

                setError(null);
            } catch (err) {
                console.error("Error fetching profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="bg-gray-900 min-h-screen text-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 min-h-screen text-gray-200 flex items-center justify-center">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-red-500">Error Loading Profile</h2>
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            {/* Profile header */}
            <div className="bg-gray-800/50 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar and name */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 uppercase rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white">
                                {userData?.username?.charAt(0)}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">{userData?.username}</h1>
                                <div className="flex items-center text-gray-400 text-sm mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                            </div> 
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 md:gap-8 md:ml-auto">
                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Global Rank</div>
                                <div className="flex items-center mt-1">
                                    <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                                    <span className="text-xl font-bold">#{userData?.userProfile?.rank}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Level</div>
                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-blue-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.level}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Problems</div>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.solved}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Streak</div>
                                <div className="flex items-center mt-1">
                                    <Coffee className="w-4 h-4 text-orange-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.streakDays} days</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 ml-auto mt-2 md:mt-0">
                            <button
                                className="p-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors"
                                onClick={() => window.location.href = '/settings'}
                            >
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
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-lg font-bold mb-4">About</h2>
                                <p className="text-gray-300">{userData?.userProfile?.bio ? userData?.userProfile?.bio : 'No bio available'}</p>

                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Preferred Languages</h3>
                                    <div className="space-y-3">
                                        {userData?.userProfile?.languages?.map((lang: { name: string; percentage: number }, i: number) => (
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

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Recent Activity</h2>
                                    <button
                                        className="text-orange-500 text-sm flex items-center hover:text-orange-400 transition-colors"
                                        onClick={() => window.location.href = '/activity'}
                                    >
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {/* <div className="space-y-4">
                                    {userData?.recentActivity.map((activity, i) => (
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
                                </div> */}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-lg font-bold mb-4">Points Summary</h2>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-500">{user?.points?.toLocaleString() ?? 0}</div>
                                    <div className="text-gray-400 mt-1">Total Points</div>
                                </div>

                                {/* <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Code className="text-blue-400" />
                                        </div>
                                        <div className="font-bold">{userData.pointsBreakdown.challenges.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Challenges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Trophy className="text-purple-400" />
                                        </div>
                                        <div className="font-bold">{userData.pointsBreakdown.contests.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Contests</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Award className="text-green-400" />
                                        </div>
                                        <div className="font-bold">{userData.pointsBreakdown.badges.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Badges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <MessageSquare className="text-yellow-400" />
                                        </div>
                                        <div className="font-bold">{userData.pointsBreakdown.discussions.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Discussions</div>
                                    </div>
                                </div> */}
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Badges</h2>
                                    <button
                                        className="text-orange-500 text-sm flex items-center hover:text-orange-400 transition-colors"
                                        onClick={() => setActiveTab('badges')}
                                    >
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {userData?.userProfile?.badges?.slice(0, 4).map((badge: Badge, i: number) => (
                                        <div key={i} className="bg-gray-750 rounded-lg p-3 flex flex-col items-center text-center group hover:bg-gray-700 transition-colors cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2 text-orange-500 group-hover:scale-110 transition-transform">
                                                {badge.iconType === 'calendar' ? <Calendar className="w-4 h-4" /> :
                                                    badge.iconType === 'code' ? <Code className="w-4 h-4" /> :
                                                        badge.iconType === 'zap' ? <Zap className="w-4 h-4" /> :
                                                            badge.iconType === 'star' ? <Star className="w-4 h-4" /> :
                                                                <Award className="w-4 h-4" />}
                                            </div>
                                            <div className="font-medium text-sm">{badge.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 border-dashed">
                                <div className="flex items-center">
                                    <Github className="w-6 h-6 mr-3 text-gray-400" />
                                    <h2 className="text-lg font-bold">GitHub Integration</h2>
                                </div>
                                {/* <p className="text-gray-400 mt-3 text-sm">
                                    {userData.githubConnected ?
                                        `Connected to ${userData.githubUsername}. Your GitHub activity is being tracked.` :
                                        "Connect your GitHub account to showcase your projects and track your coding activity."}
                                </p> */}
                                {/* <button
                                    className="w-full mt-4 px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-750 transition-colors"
                                    onClick={async () => {
                                        if (userData.githubConnected) {
                                            try {
                                                await axios.post('/api/profile/disconnect-github', { userId: userData.id });
                                                // Refresh data
                                                const response = await axios.get(`/api/profile/${userData.id}`);
                                                setUserData(response.data);
                                            } catch (err) {
                                                console.error("Error disconnecting GitHub:", err);
                                            }
                                        } else {
                                            window.location.href = '/api/auth/github';
                                        }
                                    }}
                                >
                                    {userData.githubConnected ? "Disconnect GitHub" : "Connect GitHub"}
                                </button> */}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Badges & Achievements</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {userData?.userProfile?.badges?.map((badge, i) => (
                                <div key={i} className="bg-gray-750 rounded-lg p-4 flex flex-col items-center text-center group hover:border hover:border-orange-500 transition-all cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-3 text-orange-500 group-hover:scale-110 transition-transform">
                                        {badge.iconType === 'calendar' ? <Calendar className="w-5 h-5" /> :
                                            badge.iconType === 'code' ? <Code className="w-5 h-5" /> :
                                                badge.iconType === 'zap' ? <Zap className="w-5 h-5" /> :
                                                    badge.iconType === 'star' ? <Star className="w-5 h-5" /> :
                                                        <Award className="w-5 h-5" />}
                                    </div>
                                    <div className="font-medium">{badge.name}</div>
                                    <div className="text-gray-400 text-sm mt-2">{badge.description}</div>
                                    <div className="text-orange-500 text-sm mt-1">+{badge.points} pts</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* {activeTab === 'submissions' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Recent Submissions</h2>

                        {userData.submissions && userData.submissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-gray-700">
                                            <th className="pb-2 pr-6">Problem</th>
                                            <th className="pb-2 pr-6">Language</th>
                                            <th className="pb-2 pr-6">Status</th>
                                            <th className="pb-2 pr-6">Runtime</th>
                                            <th className="pb-2">Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userData.submissions.map((submission, i) => (
                                            <tr key={i} className="border-b border-gray-700 hover:bg-gray-750">
                                                <td className="py-3 pr-6">
                                                    <div className="font-medium">{submission.problemTitle}</div>
                                                    <div className="text-sm text-gray-400">{submission.difficulty}</div>
                                                </td>
                                                <td className="py-3 pr-6">{submission.language}</td>
                                                <td className="py-3 pr-6">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${submission.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                                                            submission.status === 'Wrong Answer' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {submission.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-6">{submission.runtime}</td>
                                                <td className="py-3">{submission.submittedAt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No submissions yet.</p>
                            </div>
                        )}
                    </div>
                )} */}

                {/* {activeTab === 'contests' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Contest History</h2>

                        {userData.contests && userData.contests.length > 0 ? (
                            <div className="space-y-4">
                                {userData.contests.map((contest, i) => (
                                    <div key={i} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-750">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-lg">{contest.name}</h3>
                                                <div className="text-sm text-gray-400 mt-1">{contest.date}</div>
                                                <div className="mt-2 flex space-x-4">
                                                    <div>
                                                        <div className="text-sm text-gray-400">Rank</div>
                                                        <div className="font-medium">{contest.rank} / {contest.totalParticipants}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Score</div>
                                                        <div className="font-medium">{contest.score}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Problems Solved</div>
                                                        <div className="font-medium">{contest.problemsSolved} / {contest.totalProblems}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-orange-500 font-medium">+{contest.points} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No contest participation yet.</p>
                            </div>
                        )}
                    </div>
                )} */}

                {/* {activeTab === 'statistics' && (
                    <div className="space-y-8">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-xl font-bold mb-6">Problem-Solving Statistics</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-750 rounded-lg p-4">
                                    <div className="text-gray-400 mb-2">Problems by Difficulty</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <div className="text-green-400 font-bold text-xl">{userData.stats.problemsByDifficulty.easy}</div>
                                            <div className="text-xs text-gray-400">Easy</div>
                                        </div>
                                        <div>
                                            <div className="text-yellow-400 font-bold text-xl">{userData.stats.problemsByDifficulty.medium}</div>
                                            <div className="text-xs text-gray-400">Medium</div>
                                        </div>
                                        <div>
                                            <div className="text-red-400 font-bold text-xl">{userData.stats.problemsByDifficulty.hard}</div>
                                            <div className="text-xs text-gray-400">Hard</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-750 rounded-lg p-4">
                                    <div className="text-gray-400 mb-2">Submission Stats</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-green-400 font-bold text-xl">{userData.stats.submissionStats.accepted}</div>
                                            <div className="text-xs text-gray-400">Accepted</div>
                                        </div>
                                        <div>
                                            <div className="text-red-400 font-bold text-xl">{userData.stats.submissionStats.rejected}</div>
                                            <div className="text-xs text-gray-400">Rejected</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-750 rounded-lg p-4">
                                    <div className="text-gray-400 mb-2">Favorite Categories</div>
                                    <div className="space-y-1">
                                        {userData.stats.topCategories.map((category, i) => (
                                            <div key={i} className="text-sm">{category.name} ({category.count})</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Monthly Activity</h2>
                                <select className="bg-gray-750 border border-gray-700 rounded p-1 text-sm">
                                    <option>Last 6 Months</option>
                                    <option>Last Year</option>
                                    <option>All Time</option>
                                </select>
                            </div>

                            <div className="h-64 flex items-end">
                                {userData.stats.monthlyActivity.map((month, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div className="w-full px-1">
                                            <div
                                                className="bg-orange-500 rounded-t-sm w-full"
                                                style={{ height: `${(month.challenges / 50) * 100}%`, maxHeight: '80%', minHeight: '5%' }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">{month.month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};
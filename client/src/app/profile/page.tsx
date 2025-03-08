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
    Activity,
    MessageSquare,
    Code2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { Activity as ActivityType, Language } from '@/lib/interfaces';
import { useUserProfile } from '@/context/UserProfileContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    )
}

const ProfileContent = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [recentActivity, setRecentActivity] = useState<ActivityType[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const { userData, loading, refetchUserData } = useUserProfile();
    const { user } = useAuth();

    useEffect(() => {
        const fetchRecentActivity = async () => {
            if (!user?.id) return;
            
            try {
                setActivityLoading(true);
                const response = await fetch(`/api/activity/recent?userId=${user.id}&limit=5`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRecentActivity(data);
            } catch (error) {
                console.error("Error fetching recent activity:", error);
            } finally {
                setActivityLoading(false);
            }
        };
    
        fetchRecentActivity();
    }, [user?.id]);
    
    const handleGithubConnection = async () => {
        if (!userData) return;
        
        try {
            if (userData.githubConnected) {
                const response = await fetch('/api/profile/disconnect-github', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userData.id }),
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                toast.success('GitHub account disconnected');
                refetchUserData();
            } else {
                window.location.href = '/api/auth/github';
            }
        } catch (err) {
            console.error("Error with GitHub connection:", err);
            toast.error('Failed to update GitHub connection');
        }
    };

    if (!user) return null;

    if (loading) {
        return <Loader />;
    }

    // Prepare preferred languages data
    const languages = userData?.userProfile?.languages || [];
    const hasLanguages = languages.length > 0;

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            {/* Profile header */}
            <div className="bg-gray-800/50 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Avatar and name */}
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 border-2 border-orange-600 uppercase rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white relative group overflow-hidden">
                                {userData?.image ? (
                                    <img
                                        src={userData?.image}
                                        alt={userData?.name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.username?.charAt(0)
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">
                                    {userData?.name}
                                    <span className={`ml-2 opacity-75 font-normal text-xl`}>({userData?.username})</span>
                                </h1>
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
                                    <span className="text-xl font-bold">#{userData?.userProfile?.rank || '-'}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Level</div>
                                <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-blue-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.level || 0}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Problems</div>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.solved || 0}</span>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-3 min-w-[100px] border border-gray-700">
                                <div className="text-sm text-gray-400">Streak</div>
                                <div className="flex items-center mt-1">
                                    <Coffee className="w-4 h-4 text-orange-500 mr-2" />
                                    <span className="text-xl font-bold">{userData?.userProfile?.streakDays || 0} days</span>
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
                                    
                                    {hasLanguages ? (
                                        <div className="space-y-3">
                                            {languages.map((lang: Language, i) => (
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
                                    ) : (
                                        <div className="bg-gray-750 rounded-lg p-4 flex flex-col items-center text-center">
                                            <Code2 className="w-8 h-8 text-gray-500 mb-2" />
                                            <p className="text-gray-400">No programming languages recorded yet</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Start solving problems to track your preferred languages
                                            </p>
                                        </div>
                                    )}
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

                                {activityLoading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader />
                                    </div>
                                ) : recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity, i) => (
                                            <div key={i} className="flex items-start p-3 rounded-lg hover:bg-gray-750 transition-colors">
                                                <div className={`p-2 rounded-lg mr-3 ${
                                                    activity.type === 'challenge' ? 'bg-blue-500/20 text-blue-400' :
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
                                ) : (
                                    <div className="bg-gray-750 rounded-lg p-6 flex flex-col items-center text-center">
                                        <Activity className="w-12 h-12 text-gray-500 mb-3" />
                                        <h3 className="text-lg font-medium text-gray-300">No Recent Activity</h3>
                                        <p className="text-gray-400 mt-2 max-w-md">
                                            Your recent coding activities will appear here once you start solving challenges or participating in contests.
                                        </p>
                                        <button
                                            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm font-medium transition-colors"
                                            onClick={() => window.location.href = '/challenges'}
                                        >
                                            Explore Challenges
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h2 className="text-lg font-bold mb-4">Points Summary</h2>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-500">{userData?.userProfile?.points?.toLocaleString() ?? 0}</div>
                                    <div className="text-gray-400 mt-1">Total Points</div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Code className="text-blue-400" />
                                        </div>
                                        <div className="font-bold">{userData?.pointsBreakdown?.challenges?.toLocaleString() ?? 0}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Challenges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Trophy className="text-purple-400" />
                                        </div>
                                        <div className="font-bold">{userData?.pointsBreakdown?.contests?.toLocaleString() ?? 0}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Contests</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Award className="text-green-400" />
                                        </div>
                                        <div className="font-bold">{userData?.pointsBreakdown?.badges?.toLocaleString() ?? 0}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Badges</div>
                                    </div>

                                    <div className="bg-gray-750 rounded-lg p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                            <MessageSquare className="text-yellow-400" />
                                        </div>
                                        <div className="font-bold">{userData?.pointsBreakdown?.discussions?.toLocaleString() ?? 0}</div>
                                        <div className="text-xs text-gray-400 mt-1">From Discussions</div>
                                    </div>
                                </div>
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

                                {userData?.userProfile?.badges && userData.userProfile.badges.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {userData.userProfile.badges.slice(0, 4).map((badge, i) => (
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
                                ) : (
                                    <div className="bg-gray-750 rounded-lg p-4 flex flex-col items-center text-center">
                                        <Award className="w-10 h-10 text-gray-500 mb-2" />
                                        <p className="text-gray-400">No badges earned yet</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Complete challenges and activities to earn badges
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center">
                                    <Github className="w-6 h-6 mr-3 text-gray-400" />
                                    <h2 className="text-lg font-bold">GitHub</h2>
                                </div>
                                <p className="text-gray-400 mt-3 text-sm">
                                    {userData?.githubConnected ?
                                        `Connected to ${userData.githubUsername}. Your GitHub activity is being tracked.` :
                                        "Connect your GitHub account to showcase your projects and track your coding activity."}
                                </p>
                                <button
                                    className="w-full mt-4 px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-750 transition-colors"
                                    onClick={handleGithubConnection}
                                >
                                    {userData?.githubConnected ? "Disconnect GitHub" : "Connect GitHub"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Badges & Achievements</h2>

                        {userData?.userProfile?.badges && userData.userProfile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {userData.userProfile.badges.map((badge, i) => (
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
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-gray-750 flex items-center justify-center mb-4">
                                    <Award className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-300">No Badges Yet</h3>
                                <p className="text-gray-400 mt-3 max-w-md">
                                    You haven't earned any badges yet. Complete challenges, participate in contests, and maintain your streak to earn badges.
                                </p>
                                <button
                                    className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                    onClick={() => window.location.href = '/challenges'}
                                >
                                    Explore Challenges
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'submissions' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Your Submissions</h2>
                        
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-750 flex items-center justify-center mb-4">
                                <Code2 className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-300">No Submissions Yet</h3>
                            <p className="text-gray-400 mt-3 max-w-md">
                                You haven't submitted any solutions yet. Start solving challenges to build your submission history.
                            </p>
                            <button
                                className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                onClick={() => window.location.href = '/challenges'}
                            >
                                Start Coding
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'contests' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Contest Participation</h2>
                        
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-750 flex items-center justify-center mb-4">
                                <Trophy className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-300">No Contest History</h3>
                            <p className="text-gray-400 mt-3 max-w-md">
                                You haven't participated in any contests yet. Join upcoming contests to compete with other developers.
                            </p>
                            <button
                                className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                onClick={() => window.location.href = '/contests'}
                            >
                                Explore Contests
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'statistics' && (
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Your Statistics</h2>
                        
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-750 flex items-center justify-center mb-4">
                                <Activity className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-300">No Statistics Available</h3>
                            <p className="text-gray-400 mt-3 max-w-md">
                                You need to solve more problems to generate meaningful statistics. Start coding to track your progress.
                            </p>
                            <button
                                className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                onClick={() => window.location.href = '/challenges'}
                            >
                                Start Coding
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
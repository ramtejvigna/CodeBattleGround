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
    Clock,
    HardDrive,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Bug,
    AlertOctagon
} from 'lucide-react';
import Loader from '@/components/Loader';
import { Language } from '@/lib/interfaces';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProfileStore } from '@/lib/store/profileStore';
import toast from 'react-hot-toast';
import StatisticsDashboard from '@/components/statistics-dashboard';
import { useParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function UserProfilePage() {
    const { fetchUserProfileByUsername } = useProfileStore();
    const { username } = useParams();

    useEffect(() => {
        if (username) {
            fetchUserProfileByUsername(username as string);
        }
    }, [username, fetchUserProfileByUsername]);

    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'ACCEPTED':
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'WRONG_ANSWER':
            return <XCircle className="w-5 h-5 text-red-500" />;
        case 'TIME_LIMIT_EXCEEDED':
            return <Clock className="w-5 h-5 text-yellow-500" />;
        case 'MEMORY_LIMIT_EXCEEDED':
            return <HardDrive className="w-5 h-5 text-yellow-500" />;
        case 'RUNTIME_ERROR':
            return <Bug className="w-5 h-5 text-orange-500" />;
        case 'COMPILATION_ERROR':
            return <AlertOctagon className="w-5 h-5 text-red-500" />;
        case 'PENDING':
            return <AlertTriangle className="w-5 h-5 text-blue-500" />;
        default:
            return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
};

// Helper function to format status text
const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const ProfileContent = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Get all profile data from Zustand store
    const {
        userData,
        isLoading,
        fetchUserProfileByUsername,
        recentActivity,
        activityLoading,
        fetchRecentActivity,
        submissions,
        submissionsLoading,
        hasMoreSubmissions,
        loadMoreSubmissions,
        fetchSubmissions,
        handleGithubConnection
    } = useProfileStore();

    // Fetch profile data when user is authenticated
    useEffect(() => {
        if (userData?.username) {
            fetchUserProfileByUsername(userData.username);
        }
    }, [userData?.username, fetchUserProfileByUsername]);

    // Fetch recent activity
    useEffect(() => {
        if (userData?.id && activeTab === 'overview') {
            fetchRecentActivity(userData.id, 5);
        }
    }, [userData?.id, activeTab, fetchRecentActivity]);

    // Fetch submissions when submissions tab is active
    useEffect(() => {
        if (userData?.id && activeTab === 'submissions') {
            fetchSubmissions(userData.id, 1);
        }
    }, [userData?.id, activeTab, fetchSubmissions]);

    const handleGithubConnectionClick = async () => {
        if (!userData) return;

        try {
            const success = await handleGithubConnection(userData.id, userData.githubConnected);

            if (success) {
                toast.success('GitHub account disconnected');
                fetchUserProfileByUsername(userData.username);
            } else if (!userData.githubConnected) {
                // Redirect to GitHub auth
                window.location.href = '/api/auth/github';
            }
        } catch (err) {
            console.error("Error with GitHub connection:", err);
            toast.error('Failed to update GitHub connection');
        }
    };

    if (!userData) return null;

    if (isLoading) {
        return <Loader />;
    }

    // Prepare preferred languages data
    const submissionLanguages = submissions.reduce((acc, submission) => {
        const existingLang = acc.find(lang => lang.name === submission.language.name);
        if (existingLang) {
            // If you want to track usage count for percentage calculation
            existingLang.count = (existingLang.count || 0) + 1;
        } else {
            acc.push({
                ...submission.language,
                count: 1,
                id: '',
                percentage: 0,
                starterCode: '',
                createdAt: '',
                updatedAt: ''
            });
        }
        return acc;
    }, [] as Array<Language & { count?: number }>);

    // Calculate percentages if needed (assuming you want to show usage frequency)
    const totalSubmissions = submissions.length;
    const languagesWithPercentages = submissionLanguages.map(lang => ({
        ...lang,
        percentage: totalSubmissions > 0 ? Math.round((lang.count! / totalSubmissions) * 100) : 0
    }));

    // Get preferred language if it exists
    const preferredLanguage = userData?.userProfile?.preferredLanguage;

    // Merge languages, ensuring preferred language is included and marked
    const allLanguages = [
        // Add preferred language as a special entry if it exists
        ...(preferredLanguage ? [{
            id: 'preferred',
            name: preferredLanguage,
            percentage: 100, // or calculate if it exists in submissions
            isPreferred: true
        }] : []),

        // Add other languages from submissions
        ...languagesWithPercentages
            .filter(lang => !preferredLanguage || lang.name !== preferredLanguage)
            .map(lang => ({
                ...lang,
                isPreferred: false
            }))
    ];

    const hasLanguages = allLanguages.length > 0;

    // Get points breakdown from userData
    const pointsBreakdown = userData?.pointsBreakdown || {
        challenges: 0,
        contests: 0,
        badges: 0,
        discussions: 0
    };


    // Theme-aware styles
    const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
    const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-500';
    const hoverBg = isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100';

    return (
        <div className={`min-h-screen ${bgColor} ${textColor}`}>
            {/* Profile header */}
            <div className={`${cardBg} border-b ${borderColor}`}>
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
                                    userData?.username?.charAt(0)
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">
                                    {userData?.name}
                                    <span className={`ml-2 opacity-75 font-normal text-xl ${secondaryText}`}>({userData?.username})</span>
                                </h1>
                                <div className={`flex items-center ${secondaryText} text-sm mt-1`}>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Joined {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 md:gap-8 md:ml-auto">
                            {[
                                { icon: <Trophy className="w-4 h-4 text-yellow-500" />, label: "Global Rank", value: `#${userData.userProfile?.rank || '-'}` },
                                { icon: <Star className="w-4 h-4 text-blue-500" />, label: "Level", value: userData.userProfile?.level || 0 },
                                { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: "Problems", value: userData.userProfile?.solved || 0 },
                                { icon: <Coffee className="w-4 h-4 text-orange-500" />, label: "Streak", value: `${userData.userProfile?.streakDays || 0} days` }
                            ].map((stat, i) => (
                                <div key={i} className={`${cardBg} rounded-lg p-3 min-w-[100px] border ${borderColor}`}>
                                    <div className={`text-sm ${secondaryText}`}>{stat.label}</div>
                                    <div className="flex items-center mt-1">
                                        {stat.icon}
                                        <span className="text-xl font-bold ml-2">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 ml-auto mt-2 md:mt-0">
                            <button
                                className={`p-2 ${cardBg} ${hoverBg} border ${borderColor} rounded-lg transition-colors`}
                                onClick={() => window.location.href = '/settings'}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className={`border-b ${borderColor} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex overflow-x-auto hide-scrollbar">
                        {[{
                            label: 'Overview',
                            value: 'overview',
                        },
                        {
                            label: 'Submissions',
                            value: 'submissions',
                        },
                        {
                            label: 'Badges',
                            value: 'badges',
                        },
                        {
                            label: 'Contests',
                            value: 'contests',
                        },
                        {
                            label: 'Statistics',
                            value: 'statistics',
                        }].map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.value
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
                                <h2 className="text-lg font-bold mb-4">About</h2>
                                <p className={`${secondaryText}`}>{userData?.userProfile?.bio || 'No bio available'}</p>

                                <div className="mt-6">
                                    <h3 className={`text-sm font-semibold ${secondaryText} mb-3`}>Preferred Languages</h3>
                                    {hasLanguages ? (
                                        <div className="space-y-3">
                                            {allLanguages.map((lang, i) => (
                                                <div key={lang.id || i}>
                                                    <div className={`flex justify-between text-sm mb-1 rounded-lg p-2 w-fit ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
                                                        <span className={lang.isPreferred ? 'font-medium' : ''}>
                                                            {lang.name}
                                                            {lang.isPreferred && ' (Preferred)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`rounded-lg p-4 flex flex-col items-center text-center ${isDark ? 'bg-gray-750' : 'bg-gray-100'}`}>
                                            <Code2 className="w-8 h-8 text-gray-500 mb-2" />
                                            <p className="text-gray-400">No programming languages recorded yet</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Start solving problems to track your preferred languages
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
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
                                            <div key={i} className={`flex items-start p-3 rounded-lg ${hoverBg} transition-colors`}>
                                                <div className={`p-2 rounded-lg mr-3 ${activity.type === 'challenge' ? 'bg-blue-500/20 text-blue-400' :
                                                    activity.type === 'contest' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {activity.type === 'challenge' ? <Code className="w-5 h-5" /> :
                                                        activity.type === 'contest' ? <Trophy className="w-5 h-5" /> :
                                                            <Award className="w-5 h-5" />}
                                                </div>

                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="font-medium">{activity.name}</h3>
                                                            <div className={`text-sm ${secondaryText} mt-1`}>
                                                                {activity.result}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-orange-500 font-medium">+{activity.points}</div>
                                                            <div className={`text-sm ${secondaryText} mt-1`}>
                                                                {activity.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`rounded-lg p-6 flex flex-col items-center text-center ${isDark ? 'bg-gray-750' : 'bg-gray-100'}`}>
                                        <Activity className="w-12 h-12 text-gray-500 mb-3" />
                                        <h3 className={`text-lg font-medium ${textColor}`}>No Recent Activity</h3>
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
                            <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
                                <h2 className="text-lg font-bold mb-4">Points Summary</h2>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-500">{userData?.userProfile?.points?.toLocaleString() ?? 0}</div>
                                    <div className={`{secondaryText} mt-1`}>Total Points</div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    {[
                                        { icon: <Code className="text-blue-400" />, label: "Challenges", value: userData.pointsBreakdown?.challenges || 0 },
                                        { icon: <Trophy className="text-purple-400" />, label: "Contests", value: userData.pointsBreakdown?.contests || 0 },
                                        { icon: <Award className="text-green-400" />, label: "Badges", value: userData.pointsBreakdown?.badges || 0 },
                                        { icon: <MessageSquare className="text-yellow-400" />, label: "Discussions", value: userData.pointsBreakdown?.discussions || 0 }
                                    ].map((item, i) => (
                                        <div key={i} className={`rounded-lg p-3 text-center ${isDark ? 'bg-gray-750' : 'bg-gray-100'}`}>
                                            <div className="flex justify-center mb-2">{item.icon}</div>
                                            <div className="font-bold">{item.value.toLocaleString()}</div>
                                            <div className={`text-xs ${secondaryText} mt-1`}>From {item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress to next level */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progress to Level {(userData.userProfile?.level || 0) + 1}</span>
                                        <span className={secondaryText}>
                                            {userData.userProfile?.points || 0}/{(userData.userProfile?.level || 0 + 1) * 1000} points
                                        </span>
                                    </div>
                                    <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div
                                            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, ((userData.userProfile?.points || 0) % 1000) / 10)}%` }}
                                        ></div>
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
                                    onClick={handleGithubConnectionClick}
                                >
                                    {userData?.githubConnected ? "Disconnect GitHub" : "Connect GitHub"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
                        <h2 className="text-xl font-bold mb-6">Badges & Achievements</h2>

                        {userData?.userProfile?.badges && userData.userProfile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {userData.userProfile.badges.map((badge, i) => (
                                    <div key={i} className={`rounded-lg p-3 flex flex-col items-center text-center group ${hoverBg} transition-colors cursor-pointer`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-orange-500 group-hover:scale-110 transition-transform ${
                                                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                                                }`}>
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
                            <div className={`rounded-lg p-4 flex flex-col items-center text-center ${isDark ? 'bg-gray-750' : 'bg-gray-100'}`}>
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
                    <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
                        <h2 className="text-xl font-bold mb-6">Submissions History</h2>

                        {submissionsLoading && submissions.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <Loader />
                            </div>
                        ) : submissions.length > 0 ? (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`text-left text-sm border-b ${borderColor} ${secondaryText}`}>
                                                <th className="pb-3 pl-2">Problem</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3">Language</th>
                                                <th className="pb-3">Runtime</th>
                                                <th className="pb-3">Memory</th>
                                                <th className="pb-3 text-right pr-2">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((submission, i) => (
                                                <tr
                                                    key={i}
                                                    className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                                                    onClick={() => window.location.href = `/submissions/${submission.id}`}
                                                >
                                                    <td className="py-3 pl-2">
                                                        <div className="font-medium">{submission.challenge?.title}</div>
                                                        <div className={`text-sm ${secondaryText} capitalize font-semibold`}>{submission.challenge?.difficulty ? String(submission.challenge.difficulty) : 'N/A'}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center">
                                                            {getStatusIcon(submission.status)}
                                                            <span className="ml-2">{formatStatus(submission.status)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">{submission?.language ? String(submission.language.name) : 'N/A'}</td>
                                                    <td className="py-3">{submission.runtime}ms</td>
                                                    <td className="py-3">{submission?.memory} KB</td>
                                                    <td className={`py-3 text-right pr-2 ${secondaryText}`}>
                                                        {formatDate(submission.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {submissionsLoading && submissions.length > 0 && (
                                    <div className="flex justify-center py-4">
                                        <Loader />
                                    </div>
                                )}

                                {hasMoreSubmissions && !submissionsLoading && (
                                    <div className="mt-6 text-center">
                                        <button
                                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isDark ? 'bg-gray-750 border border-gray-700 hover:bg-gray-700' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                                            }`}
                                            onClick={loadMoreSubmissions}
                                        >
                                            Load More Submissions
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center">
                                <Code2 className="w-12 h-12 text-gray-500 mb-4" />
                                <h3 className={`text-xl font-medium ${textColor}`}>No Submissions Yet</h3>
                                <p className={`${secondaryText} mt-3 max-w-md`}>
                                    You haven't submitted any solutions yet. Start solving coding challenges to build your submission history.
                                </p>
                                <button
                                    className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                    onClick={() => window.location.href = '/challenges'}
                                >
                                    Find Challenges
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'contests' && (
                    <div className={`rounded-xl p-6 border ${borderColor} ${cardBg}`}>
                        <h2 className="text-xl font-bold mb-6">Contest History</h2>

                        <div className="py-12 flex flex-col items-center text-center">
                            <Trophy className="w-12 h-12 text-gray-500 mb-4" />
                            <h3 className={`text-xl font-medium ${textColor}`}>No Contest Participation Yet</h3>
                            <p className={`${secondaryText} mt-3 max-w-md`}>
                                You haven't participated in any contests yet. Join upcoming contests to compete with other developers and earn ranking points.
                            </p>
                            <button
                                className="mt-6 px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                                onClick={() => window.location.href = '/contests'}
                            >
                                View Upcoming Contests
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <StatisticsDashboard submissions={submissions} />
                )}
            </div>
        </div>
    );
};

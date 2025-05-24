"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Code,
    Trophy,
    Award,
    Calendar,
    Filter,
    Clock,
    CheckCircle,
    Star,
    Zap,
    TrendingUp,
    RefreshCw,
    User,
    ChevronDown,
    Search,
    ArrowUp,
    Coffee,
    Target,
    Flame
} from 'lucide-react';
import { useProfileStore } from '@/lib/store/profileStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import Loader from '@/components/Loader';
import ProtectedRoute from '@/components/ProtectedRoute';

// Activity type icons mapping
const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'challenge':
            return <Code className="w-5 h-5" />;
        case 'contest':
            return <Trophy className="w-5 h-5" />;
        case 'badge':
            return <Award className="w-5 h-5" />;
        case 'streak':
            return <Flame className="w-5 h-5" />;
        case 'level':
            return <Star className="w-5 h-5" />;
        default:
            return <Activity className="w-5 h-5" />;
    }
};

// Activity type colors
const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'challenge':
            return {
                bg: 'from-blue-500/20 to-blue-600/20',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
                icon: 'bg-blue-500/20 text-blue-400'
            };
        case 'contest':
            return {
                bg: 'from-purple-500/20 to-purple-600/20',
                border: 'border-purple-500/30',
                text: 'text-purple-400',
                icon: 'bg-purple-500/20 text-purple-400'
            };
        case 'badge':
            return {
                bg: 'from-green-500/20 to-green-600/20',
                border: 'border-green-500/30',
                text: 'text-green-400',
                icon: 'bg-green-500/20 text-green-400'
            };
        case 'streak':
            return {
                bg: 'from-orange-500/20 to-orange-600/20',
                border: 'border-orange-500/30',
                text: 'text-orange-400',
                icon: 'bg-orange-500/20 text-orange-400'
            };
        default:
            return {
                bg: 'from-gray-500/20 to-gray-600/20',
                border: 'border-gray-500/30',
                text: 'text-gray-400',
                icon: 'bg-gray-500/20 text-gray-400'
            };
    }
};

// Points color based on value
const getPointsColor = (points: number) => {
    if (points >= 50) return 'text-yellow-400';
    if (points >= 20) return 'text-green-400';
    if (points >= 10) return 'text-blue-400';
    return 'text-gray-400';
};

const ActivityPage = () => {
    const { theme } = useTheme();
    const { user } = useAuthStore();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        allActivities,
        allActivitiesLoading,
        hasMoreActivities,
        activitiesTimeRange,
        activitiesType,
        fetchAllActivities,
        loadMoreActivities,
        setActivitiesTimeRange,
        setActivitiesType,
        userData
    } = useProfileStore();

    const isDark = theme === 'dark';

    // Load activities when component mounts
    useEffect(() => {
        if (user?.id) {
            fetchAllActivities(user.id, 1);
        }
    }, [user?.id, fetchAllActivities]);

    // Handle scroll to show back to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter activities based on search query
    const filteredActivities = allActivities.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate activity stats
    const activityStats = {
        total: allActivities.length,
        totalPoints: allActivities.reduce((sum, activity) => sum + activity.points, 0),
        challenges: allActivities.filter(a => a.type === 'CHALLENGE').length,
        contests: allActivities.filter(a => a.type === 'CONTEST').length,
        badges: allActivities.filter(a => a.type === 'BADGE').length,
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Theme-aware styles
    const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
    const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const secondaryText = isDark ? 'text-gray-400' : 'text-gray-500';
    const hoverBg = isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50';

    return (
        <ProtectedRoute>
            <div className={`min-h-screen ${bgColor} ${textColor}`}>
                {/* Header Section */}
                <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 backdrop-blur-md bg-opacity-90`}>
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                        >
                            {/* Title and stats */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                                            Activity Feed
                                        </h1>
                                        <p className={`${secondaryText} text-sm`}>
                                            Track your coding journey and achievements
                                        </p>
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <div className={`${cardBg} ${borderColor} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                                        <Target className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium">{activityStats.total} Activities</span>
                                    </div>
                                    <div className={`${cardBg} ${borderColor} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm font-medium">{activityStats.totalPoints.toLocaleString()} Points</span>
                                    </div>
                                    <div className={`${cardBg} ${borderColor} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                                        <Code className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">{activityStats.challenges} Challenges</span>
                                    </div>
                                </div>
                            </div>

                            {/* Search and filters */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${secondaryText}`} />
                                    <input
                                        type="text"
                                        placeholder="Search activities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`${cardBg} ${borderColor} border rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all`}
                                    />
                                </div>

                                {/* Filter button */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className={`${cardBg} ${borderColor} border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all ${hoverBg}`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filters
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    {/* Filter dropdown */}
                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className={`absolute top-full mt-2 right-0 ${cardBg} ${borderColor} border rounded-lg shadow-lg p-4 w-72 z-50`}
                                            >
                                                <div className="space-y-4">
                                                    {/* Time range filter */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Time Range</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['all', 'week', 'month', 'year'].map((range) => (
                                                                <button
                                                                    key={range}
                                                                    onClick={() => setActivitiesTimeRange(range as any)}
                                                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                                                        activitiesTimeRange === range
                                                                            ? 'bg-orange-500 text-white'
                                                                            : `${hoverBg} ${borderColor} border`
                                                                    }`}
                                                                >
                                                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Type filter */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Activity Type</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { value: 'all', label: 'All', icon: Activity },
                                                                { value: 'challenge', label: 'Challenges', icon: Code },
                                                                { value: 'contest', label: 'Contests', icon: Trophy },
                                                                { value: 'badge', label: 'Badges', icon: Award }
                                                            ].map((type) => (
                                                                <button
                                                                    key={type.value}
                                                                    onClick={() => setActivitiesType(type.value as any)}
                                                                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                                                                        activitiesType === type.value
                                                                            ? 'bg-orange-500 text-white'
                                                                            : `${hoverBg} ${borderColor} border`
                                                                    }`}
                                                                >
                                                                    <type.icon className="w-4 h-4" />
                                                                    {type.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {allActivitiesLoading && allActivities.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
                                <Activity className={`w-10 h-10 ${secondaryText}`} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {searchQuery ? 'No matching activities found' : 'No activities yet'}
                            </h3>
                            <p className={`${secondaryText} max-w-md mx-auto`}>
                                {searchQuery 
                                    ? 'Try adjusting your search terms or filters.' 
                                    : 'Start solving challenges and participating in contests to see your activity feed!'
                                }
                            </p>
                            {!searchQuery && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.href = '/challenges'}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                                >
                                    Explore Challenges
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {filteredActivities.map((activity, index) => {
                                const colors = getActivityColor(activity.type);
                                return (
                                    <motion.div
                                        key={activity.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                        className={`${cardBg} ${borderColor} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r ${colors.bg} backdrop-blur-sm`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                {/* Activity icon */}
                                                <div className={`p-3 rounded-xl ${colors.icon} flex-shrink-0`}>
                                                    {getActivityIcon(activity.type)}
                                                </div>

                                                {/* Activity details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-lg truncate">
                                                            {activity.name}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.icon} border ${colors.border}`}>
                                                            {activity.type}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className={`${secondaryText} mb-3`}>
                                                        {activity.result}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className={`w-4 h-4 ${secondaryText}`} />
                                                            <span className={secondaryText}>{activity.time}</span>
                                                        </div>
                                                        
                                                        {activity.user && (
                                                            <div className="flex items-center gap-1">
                                                                <User className={`w-4 h-4 ${secondaryText}`} />
                                                                <span className={secondaryText}>{activity.user.username}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Points */}
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className={`text-2xl font-bold ${getPointsColor(activity.points)}`}>
                                                    +{activity.points}
                                                </div>
                                                <div className={`text-sm ${secondaryText}`}>points</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Load more button */}
                            {hasMoreActivities && !allActivitiesLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={loadMoreActivities}
                                        className={`px-8 py-3 ${cardBg} ${borderColor} border rounded-xl font-medium transition-all ${hoverBg} hover:shadow-md`}
                                    >
                                        Load More Activities
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Loading more indicator */}
                            {allActivitiesLoading && allActivities.length > 0 && (
                                <div className="flex justify-center py-8">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                                        <span className={secondaryText}>Loading more activities...</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Scroll to top button */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToTop}
                            className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Click outside to close filter */}
                {isFilterOpen && (
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsFilterOpen(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ActivityPage; 
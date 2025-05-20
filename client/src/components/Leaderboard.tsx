import React, { useEffect } from 'react';
import { useLeaderboardStore } from '../lib/store/leaderboardStore';
import { useAuthStore } from '../lib/store/authStore';
import Image from 'next/image';

const Leaderboard: React.FC = () => {
    const { entries, loading, error, fetchLeaderboard } = useLeaderboardStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchLeaderboard();
        // Refresh leaderboard every 5 minutes
        const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    if (loading) {
        return <div className="flex justify-center items-center p-8">Loading leaderboard...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
            <div className="space-y-4">
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        className={`flex items-center p-4 rounded-lg ${
                            entry.id === user?.id
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50'
                        }`}
                    >
                        <div className="flex-shrink-0 w-12 text-center font-bold">
                            #{entry.rank}
                        </div>
                        <div className="flex-shrink-0 w-12 h-12 relative">
                            {entry.avatarUrl ? (
                                <Image
                                    src={entry.avatarUrl}
                                    alt={entry.username}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                    {entry.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-grow">
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-gray-500">
                                Level {entry.level} • {entry.points} points
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard; 
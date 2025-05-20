import { create } from 'zustand';
import { User } from './authStore';

export interface LeaderboardEntry {
    id: string;
    username: string;
    points: number;
    level: number;
    rank: number;
    avatarUrl?: string;
}

interface LeaderboardState {
    entries: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
    fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
    entries: [],
    loading: false,
    error: null,

    fetchLeaderboard: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/leaderboard');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            set({ entries: data.entries });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to fetch leaderboard' });
        } finally {
            set({ loading: false });
        }
    },
})); 
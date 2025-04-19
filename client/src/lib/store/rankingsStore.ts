import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '../interfaces';

interface RankingsState {
  topUsers: User[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number;
  
  fetchRankings: (limit?: number) => Promise<void>;
}

// Time threshold for refetching (10 minutes in milliseconds)
const REFETCH_THRESHOLD = 10 * 60 * 1000;

export const useRankingsStore = create<RankingsState>()(
  persist(
    (set, get) => ({
      topUsers: [],
      isLoading: false,
      error: null,
      lastFetched: 0,

      fetchRankings: async (limit = 100) => {
        const currentTime = Date.now();
        const state = get();
        
        // Only refetch if data is stale or we have no data
        if (
          state.topUsers.length === 0 ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD
        ) {
          try {
            set({ isLoading: true });
            
            const response = await fetch('/api/rankings');
            
            if (!response.ok) {
              throw new Error('Failed to fetch rankings');
            }
            
            const data = await response.json();
            
            set({
              topUsers: data || [],
              isLoading: false,
              error: null,
              lastFetched: currentTime,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'An unknown error occurred',
            });
          }
        }
      },
    }),
    {
      name: 'rankings-storage',
      partialize: (state) => ({
        topUsers: state.topUsers,
        lastFetched: state.lastFetched,
      }),
    }
  )
); 
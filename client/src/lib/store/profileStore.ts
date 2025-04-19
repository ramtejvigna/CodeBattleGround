import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PointsBreakdown {
  challenges: number;
  contests: number;
  badges: number;
  discussions: number;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  createdAt: string;
  githubConnected: boolean;
  githubUsername: string;
  userProfile: {
    points: number;
    level: number;
    rank: number;
    bio: string;
    streakDays: number;
    solved: number;
    badges: any[];
    languages: any[];
  };
  pointsBreakdown: PointsBreakdown;
}

interface ProfileState {
  userData: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number;
  
  fetchUserProfile: (username: string) => Promise<void>;
}

// Time threshold for refetching (5 minutes in milliseconds)
const REFETCH_THRESHOLD = 5 * 60 * 1000;

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      userData: null,
      isLoading: false,
      error: null,
      lastFetched: 0,

      fetchUserProfile: async (userId: string) => {
        if (!userId) return;
        
        const currentTime = Date.now();
        const state = get();
        
        // Only refetch if data is stale, we have no data, or username changed
        if (
          !state.userData ||
          state.userData.id !== userId ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD
        ) {
          try {
            set({ isLoading: true });
            
            const response = await fetch(`/api/profile?id=${userId}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch profile data');
            }
            
            const data = await response.json();
            
            if (data.success && data.user) {
              set({
                userData: data.user,
                isLoading: false,
                error: null,
                lastFetched: currentTime,
              });
            } else {
              throw new Error(data.message || 'Failed to fetch profile data');
            }
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
      name: 'profile-storage',
      partialize: (state) => ({
        userData: state.userData,
        lastFetched: state.lastFetched,
      }),
    }
  )
); 
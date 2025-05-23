// lib/store/profileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PointsBreakdown {
  challenges: number;
  contests: number;
  badges: number;
  discussions: number;
}

interface UserProfileData {
  points: number;
  level: number;
  rank: number;
  bio?: string;
  phone?: string;
  preferredLanguage?: string;
  streakDays: number;
  solved: number;
  badges: any[];
  languages: any[];
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string;
  createdAt: string;
  githubConnected: boolean;
  githubUsername?: string;
  userProfile: UserProfileData;
  pointsBreakdown: PointsBreakdown;
}

interface Activity {
  id: string;
  type: string;
  name: string;
  result: string;
  points: number;
  time: string;
}

export interface Submission {
  id: string;
  status: string;
  language: { name: string };
  runtime: string;
  memory: string;
  createdAt: string;
  challenge: { title: string; difficulty: string };
}

interface ProfileState {
  userData: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number;
  
  // Activity data
  recentActivity: Activity[];
  activityLoading: boolean;
  
  // Submissions data
  submissions: Submission[];
  submissionsLoading: boolean;
  submissionsPage: number;
  hasMoreSubmissions: boolean;
  
  // Add new property for tracking submission fetch status
  submissionsLastFetched: number;
  
  fetchUserProfileById: (userId: string) => Promise<void>;
  fetchUserProfileByUsername: (username: string) => Promise<void>;
  updateUserProfile: (userId: string, updateData: {
    name?: string;
    email?: string;
    image?: string | null;
    profile?: {
      phone?: string;
      bio?: string;
      preferredLanguage?: string;
    };
  }) => Promise<void>;
  clearProfile: () => void;
  
  // New functions
  fetchRecentActivity: (userId: string, limit?: number) => Promise<void>;
  fetchSubmissions: (userId: string, page?: number, limit?: number) => Promise<void>;
  loadMoreSubmissions: () => void;
  handleGithubConnection: (userId: string, isConnected: boolean) => Promise<boolean>;
  
  // Add new comprehensive data loading function
  loadProfileData: (username: string) => Promise<void>;
}

// Time threshold for refetching (5 minutes in milliseconds)
const REFETCH_THRESHOLD = 5 * 60 * 1000;

// Add these utility functions before the useProfileStore definition
const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

const calculateStreak = (submissions: Submission[]): number => {
  if (!submissions.length) return 0;
  
  // Sort submissions by date in descending order and get unique dates
  const uniqueDates = [...new Set(
    submissions.map(sub => new Date(sub.createdAt).toDateString())
  )].map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If no submission today or yesterday, streak is 0
  if (uniqueDates[0].getTime() < today.getTime() - (24 * 60 * 60 * 1000)) {
    return 0;
  }

  let currentStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (isConsecutiveDay(uniqueDates[i+1], uniqueDates[i])) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      userData: null,
      isLoading: false,
      error: null,
      lastFetched: 0,
      
      // Activity data
      recentActivity: [],
      activityLoading: false,
      
      // Submissions data
      submissions: [],
      submissionsLoading: false,
      submissionsPage: 1,
      hasMoreSubmissions: true,
      
      // Add new property for tracking submission fetch status
      submissionsLastFetched: 0,
      
      fetchUserProfileById: async (userId: string) => {
        if (!userId) return;
        
        const currentTime = Date.now();
        const state = get();
        
        // Only refetch if data is stale, we have no data, or user ID changed
        if (
          !state.userData ||
          state.userData.id !== userId ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD
        ) {
          try {
            set({ isLoading: true, error: null });
            
            const response = await fetch(`/api/profile?id=${userId}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch profile data');
            }
            
            const data = await response.json();
            
            if (data.success && data.user) {
              set({
                userData: data.user,
                isLoading: false,
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

      fetchUserProfileByUsername: async (username: string) => {
        if (!username) return;
        
        const currentTime = Date.now();
        const state = get();
        
        // Only refetch if data is stale, we have no data, or username changed
        if (
          !state.userData ||
          state.userData.username !== username ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD
        ) {
          try {
            set({ isLoading: true, error: null });
            
            const response = await fetch(`/api/profile/by-username?username=${username}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch profile data');
            }
            
            const data = await response.json();
            
            if (data.success && data.user) {
              set({
                userData: data.user,
                isLoading: false,
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

      updateUserProfile: async (userId: string, updateData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              ...updateData,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
          }

          if (data.success && data.user) {
            set({
              userData: data.user,
              isLoading: false,
            });
            return data.user;
          } else {
            throw new Error(data.message || 'Failed to update profile');
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update profile',
          });
          throw error;
        }
      },

      clearProfile: () => {
        set({
          userData: null,
          isLoading: false,
          error: null,
          lastFetched: 0,
          recentActivity: [],
          submissions: [],
          submissionsPage: 1,
          hasMoreSubmissions: true,
        });
      },
      
      // New functions for improved state management
      fetchRecentActivity: async (userId: string, limit = 5) => {
        if (!userId) return;
        
        try {
          set({ activityLoading: true });
          const response = await fetch(`/api/activity/recent?userId=${userId}&limit=${limit}`);
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          set({ 
            recentActivity: data,
            activityLoading: false 
          });
        } catch (error) {
          console.error("Error fetching recent activity:", error);
          set({ activityLoading: false });
        }
      },
      
      fetchSubmissions: async (userId: string, page = 1, limit = 10) => {
        if (!userId) return;
        
        try {
          set({ submissionsLoading: true });
          const response = await fetch(`/api/submissions?userId=${userId}&page=${page}&limit=${limit}`);
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          const currentTime = Date.now();
          
          if (page === 1) {
            const newSubmissions = data.submissions;
            const streak = calculateStreak(newSubmissions);
            
            set(state => ({
              submissions: newSubmissions,
              submissionsLoading: false,
              hasMoreSubmissions: data.hasMore,
              submissionsLastFetched: currentTime,
              userData: state.userData ? {
                ...state.userData,
                userProfile: {
                  ...state.userData.userProfile,
                  streakDays: streak
                }
              } : null
            }));
          } else {
            const currentSubmissions = get().submissions;
            const allSubmissions = [...currentSubmissions, ...data.submissions];
            const streak = calculateStreak(allSubmissions);
            
            set(state => ({
              submissions: allSubmissions,
              submissionsLoading: false,
              hasMoreSubmissions: data.hasMore,
              submissionsLastFetched: currentTime,
              userData: state.userData ? {
                ...state.userData,
                userProfile: {
                  ...state.userData.userProfile,
                  streakDays: streak
                }
              } : null
            }));
          }
        } catch (error) {
          console.error("Error fetching submissions:", error);
          set({ submissionsLoading: false });
        }
      },
      
      loadMoreSubmissions: () => {
        const { userData, submissionsPage } = get();
        if (userData?.id) {
          set({ submissionsPage: submissionsPage + 1 });
          get().fetchSubmissions(userData.id, submissionsPage + 1);
        }
      },
      
      handleGithubConnection: async (userId: string, isConnected: boolean) => {
        if (!userId) return false;
        
        try {
          if (isConnected) {
            const response = await fetch('/api/profile/disconnect-github', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to disconnect GitHub account');
            }
            
            // Update user data after success
            const userData = get().userData;
            if (userData) {
              set({
                userData: {
                  ...userData,
                  githubConnected: false,
                  githubUsername: undefined
                }
              });
            }
            
            return true;
          } else {
            // Return false to indicate client-side redirect is needed
            return false;
          }
        } catch (error) {
          console.error("Error with GitHub connection:", error);
          return false;
        }
      },
      
      // Add new comprehensive data loading function
      loadProfileData: async (username: string) => {
        if (!username) return;
        
        const currentTime = Date.now();
        const state = get();
        
        // Check if we need to reload profile data
        const shouldReloadProfile = !state.userData || 
          state.userData.username !== username ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD;
          
        // Check if we need to reload submissions
        const shouldReloadSubmissions = !state.submissions.length ||
          state.userData?.id !== state.userData?.id ||
          currentTime - state.submissionsLastFetched > REFETCH_THRESHOLD;
        
        try {
          if (shouldReloadProfile) {
            await get().fetchUserProfileByUsername(username);
          }
          
          // Only fetch submissions if we have userData
          const userData = get().userData;
          if (userData?.id && shouldReloadSubmissions) {
            set({ submissionsLoading: true });
            
            // Fetch submissions and update streak
            await get().fetchSubmissions(userData.id, 1);
            set({ submissionsLastFetched: currentTime });
            
            // Fetch recent activity
            await get().fetchRecentActivity(userData.id, 5);
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load profile data',
            isLoading: false,
            submissionsLoading: false
          });
        }
      }
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({
        userData: state.userData,
        lastFetched: state.lastFetched,
      }),
      // Optional migration logic if store structure changes in future
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return persistedState;
        }
        return persistedState;
      },
      version: 1, // Increment this when making breaking changes
    }
  )
);

// Utility hook for easy access to user profile data
export const useUserProfile = () => {
  return useProfileStore((state) => state.userData?.userProfile);
};

// Utility hook for easy access to user points
export const useUserPoints = () => {
  return useProfileStore((state) => state.userData?.userProfile.points ?? 0);
};
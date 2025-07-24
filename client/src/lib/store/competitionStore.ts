import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  participants: {
    id: string;
    userId: string;
  }[];
  createdAt: string;
}

interface CompetitionParticipation {
  id: string;
  userId: string;
  competitionId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'JOINED' | 'ACTIVE' | 'COMPLETED' | 'LEFT' | 'DISQUALIFIED';
  rank?: number;
  pointsEarned: number;
  challengesSolved: number;
  timeSpent: number;
  badges?: string[];
  perks?: any;
  performance?: any;
  completedAt?: string;
  competition?: Competition;
}

interface UserCompetitionStats {
  totalCompetitions: number;
  upcomingCompetitions: number;
  activeCompetitions: number;
  completedCompetitions: number;
  totalPointsEarned: number;
  averageRank?: number;
  badges: string[];
  perks: any[];
}

interface CreateCompetitionData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

interface UpdateCompetitionData extends CreateCompetitionData {
  id: string;
}

interface CompetitionState {
  competitions: Competition[];
  userParticipations: CompetitionParticipation[];
  userStats: UserCompetitionStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number;

  // Fetch actions
  fetchCompetitions: () => Promise<void>;
  fetchUserCompetitions: () => Promise<void>;
  fetchUserParticipation: (competitionId: string) => Promise<CompetitionParticipation | null>;
  createCompetition: (data: CreateCompetitionData) => Promise<void>;
  updateCompetition: (data: UpdateCompetitionData) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  joinCompetition: (id: string) => Promise<{ bonusEarned?: number; perks?: any; participation?: CompetitionParticipation }>;
  leaveCompetition: (id: string) => Promise<{ penalty?: any; participation?: CompetitionParticipation }>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

// Time threshold for refetching (5 minutes in milliseconds)
const REFETCH_THRESHOLD = 5 * 60 * 1000;

export const useCompetitionStore = create<CompetitionState>()(
  persist(
    (set, get) => ({
      competitions: [],
      userParticipations: [],
      userStats: null,
      isLoading: false,
      error: null,
      lastFetched: 0,

      fetchCompetitions: async () => {
        const currentTime = Date.now();
        const state = get();
        
        // Only refetch if data is stale
        if (
          state.competitions.length === 0 ||
          currentTime - state.lastFetched > REFETCH_THRESHOLD
        ) {
          try {
            set({ isLoading: true, error: null });
            
            const response = await fetch('/api/competitions');
            
            if (!response.ok) {
              throw new Error('Failed to fetch competitions');
            }
            
            const competitions = await response.json();
            
            set({
              competitions,
              isLoading: false,
              error: null,
              lastFetched: currentTime,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch competitions',
            });
          }
        }
      },

      fetchUserCompetitions: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/profile/competitions');
          
          if (!response.ok) {
            throw new Error('Failed to fetch user competitions');
          }
          
          const data = await response.json();
          
          set({
            userParticipations: data.participations || [],
            userStats: data.statistics || null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user competitions',
          });
        }
      },

      fetchUserParticipation: async (competitionId: string) => {
        try {
          const response = await fetch('/api/profile/competitions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ competitionId }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch participation details');
          }

          const data = await response.json();
          return data.participation;
        } catch (error) {
          console.error('Error fetching participation:', error);
          return null;
        }
      },

      createCompetition: async (data: CreateCompetitionData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/competitions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to create competition');
          }

          const newCompetition = await response.json();
          
          set((state) => ({
            competitions: [...state.competitions, newCompetition],
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create competition',
          });
        }
      },

      updateCompetition: async (data: UpdateCompetitionData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/competitions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update competition');
          }

          const updatedCompetition = await response.json();
          
          set((state) => ({
            competitions: state.competitions.map((comp) =>
              comp.id === updatedCompetition.id ? updatedCompetition : comp
            ),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update competition',
          });
        }
      },

      deleteCompetition: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/competitions', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
          });

          if (!response.ok) {
            throw new Error('Failed to delete competition');
          }

          set((state) => ({
            competitions: state.competitions.filter((comp) => comp.id !== id),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to delete competition',
          });
        }
      },

      joinCompetition: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/competitions/${id}/join`, {
            method: 'POST',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to join competition');
          }

          const result = await response.json();
          
          // Refresh competitions and user data after joining
          await get().fetchCompetitions();
          await get().fetchUserCompetitions();
          
          set({ isLoading: false, error: null });
          
          return {
            bonusEarned: result.bonusEarned,
            perks: result.perks,
            participation: result.participation
          };
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to join competition',
          });
          throw error;
        }
      },

      leaveCompetition: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/competitions/${id}/leave`, {
            method: 'POST',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to leave competition');
          }

          const result = await response.json();
          
          // Refresh competitions and user data after leaving
          await get().fetchCompetitions();
          await get().fetchUserCompetitions();
          
          set({ isLoading: false, error: null });
          
          return {
            penalty: result.penalty,
            participation: result.participation
          };
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to leave competition',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      reset: () => set({
        competitions: [],
        userParticipations: [],
        userStats: null,
        isLoading: false,
        error: null,
        lastFetched: 0,
      }),
    }),
    {
      name: 'competition-storage',
      partialize: (state) => ({
        competitions: state.competitions,
        userParticipations: state.userParticipations,
        userStats: state.userStats,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

export interface User {
    id: string;
    email: string;
    name: string | null;
    username: string;
    image: string | null;
    githubConnected: boolean;
    githubUsername?: string;
    createdAt: string;
    updatedAt: string;
    userProfile?: UserProfile;
    points?: number;
    pointsBreakdown?: {
        challenges: number;
        contests: number;
        badges: number;
        discussions: number;
    };
}

export interface UserProfile {
    id: string;
    userId: string;
    rank: number;
    bio: string;
    phone?: string;
    solved: number;
    preferredLanguage: string;
    level: number;
    points: number;
    streakDays: number;
    badges: Badge[];
    languages: Language[];
    createdAt: string;
    updatedAt: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    iconType: 'calendar' | 'code' | 'zap' | 'star' | 'award';
    points: number;
}

export interface Language {
    name: string;
    percentage: number;
}

export interface Activity {
    id: string;
    userId: string;
    type: 'challenge' | 'contest' | 'badge';
    name: string;
    result: string;
    points: number;
    time: string;
    createdAt: string;
}
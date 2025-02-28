export interface Badge {
    iconType: 'calendar' | 'code' | 'zap' | 'star' | 'award';
    name: string;
    description?: string;
    points?: number;
}

export interface User {
    id: string,
    username: string,
    name: string,
    email: string,
    image?: string | null,
    createdAt?: Date,
    userProfile?: UserProfile
}

interface Language {
    name: string;
    percentage: number;
}
export interface UserProfile {
    id: string;
    userId: string;
    rank: number;
    solved: number;
    languages: Language[];
    preferredLanguage: string;
    level: number;
    points: number;
    streakDays: number;
    badges: Badge[];
    bio?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
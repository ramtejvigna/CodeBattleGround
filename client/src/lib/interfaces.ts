export interface User {
    id: string;
    email: string;
    password?: string;
    name: string | null;
    username: string;
    image: string | null;
    emailVerified: string | null;
    githubConnected: boolean;
    githubUsername?: string | null;
    createdAt: string;
    updatedAt: string;
    userProfile?: UserProfile;
    sessions?: Session[];
    accounts?: Account[];
    activities?: Activity[];
    createChallenges?: Challenge[];
    submissions?: Submission[];
    challengeAttempts?: ChallengeAttempt[];
    challengeLikes?: ChallengeLike[];
}

export interface UserProfile {
    id: string;
    userId: string;
    rank: number;
    bio: string;
    phone?: string | null;
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
    iconType: string;
    points: number;
    createdAt: string;
    updatedAt: string;
}

export interface Language {
    id: string;
    name: string;
    starterCode: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    id: string;
    userId: string;
    type: string;
    name: string;
    result: string;
    points: number;
    time: string;
    createdAt: string;
}

export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
}

export interface Session {
    id: string;
    sessionToken: string;
    userId: string;
    expires: string;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    points: number;
    creatorId: string;
    categoryId: string;
    testCases?: TestCase[];
    languages: Language[];
    submissions?: Submission[];
    attempts?: ChallengeAttempt[];
    likes?: ChallengeLike[];
    category?: ChallengeCategory;
    creator?: User;
    timeLimit: number; // Time limit in seconds
    memoryLimit: number; // Memory limit in MB
    createdAt: string;
    updatedAt: string;
}

export interface ChallengeCategory {
    id: string;
    name: string;
    description?: string | null;
    challenges?: Challenge[];
}

export interface TestCase {
    id: string;
    challengeId: string;
    input: string;
    output: string;
    isHidden: boolean;
    explanation?: string | null;
}

export interface Submission {
    id: string;
    userId: string;
    challengeId: string;
    code: string;
    languageId: string;
    status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
    runtime?: number | null; // in milliseconds
    memory?: number | null; // in KB
    testResults?: any; // Results of each test case
    createdAt: string;
    language?: Language;
    user?: User;
    challenge?: Challenge;
}

export interface ChallengeAttempt {
    id: string;
    userId: string;
    challengeId: string;
    startedAt: string;
    completedAt?: string | null;
    successful?: boolean | null;
    user?: User;
    challenge?: Challenge;
}

export interface ChallengeLike {
    id: string;
    userId: string;
    challengeId: string;
    isLike: boolean; // true for like, false for dislike
    createdAt: string;
    user?: User;
    challenge?: Challenge;
}

// Add this to match with mock data in the component
export interface ChallengeListItem {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    points: number;
    category: string;
    likes: number;
    submissions: number;
    successRate: number;
    languages: string[];
    createdAt: string;
}
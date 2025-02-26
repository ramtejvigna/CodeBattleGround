"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define user type
export interface User {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    preferredLanguage?: string;
    avatarUrl?: string;
    level?: number;
    points?: number;
}

// Define auth context type
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: Partial<User> & { password: string }) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for AuthProvider
interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Check if user is authenticated on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/session');
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Redirect to login if accessing protected route without auth
    useEffect(() => {
        if (!loading && !user) {
            const protectedRoutes = ['/dashboard', '/profile', '/challenges'];

            // Check if current path is protected and user is not authenticated
            if (protectedRoutes.some(route => pathname?.startsWith(route))) {
                router.push('/login');
            }
        }

        // Redirect to dashboard if authenticated user tries to access auth pages
        if (!loading && user) {
            const authRoutes = ['/login', '/signup'];

            if (authRoutes.includes(pathname || '')) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    // Login function
    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser(data.user);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Signup function
    const signup = async (userData: Partial<User> & { password: string }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setUser(data.user);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);

        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
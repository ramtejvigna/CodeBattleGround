"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/lib/interfaces';
import { useAuth } from './AuthContext';

// Create a context for the user profile
interface UserProfileContextProps {
    userData: User | null;
    setUserData: (user: User | null) => void;
    loading: boolean;
    error: string | null;
    refetchUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextProps | undefined>(undefined);

// Create a provider component
export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchUserData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/profile?id=${user.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUserData(data.user);
            setError(null);
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch when component mounts or user changes
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return (
        <UserProfileContext.Provider value={{
            userData,
            setUserData,
            loading,
            error,
            refetchUserData: fetchUserData
        }}>
            {children}
        </UserProfileContext.Provider>
    );
};

// Create a hook to use the user profile context
export const useUserProfile = () => {
    const context = useContext(UserProfileContext);

    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }

    return context;
};
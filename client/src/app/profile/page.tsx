"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.push(`/profile/${user.username}`);
        } else if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    return (
        <div className="h-screen flex items-center justify-center bg-gray-900">
            <Loader />
        </div>
    );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { useChallengesStore, useRankingsStore, useProfileStore } from "@/lib/store";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Get fetch functions from stores
    const { fetchChallenges } = useChallengesStore();
    const { fetchRankings } = useRankingsStore();

    // Define routes where you don't want to show NavBar and Footer
    const noNavBarFooterRoutes = ["/login", "/signup", "/admin"];

    // Check if the current route is in the noNavBarFooterRoutes array
    const shouldShowNavBarFooter = !noNavBarFooterRoutes.includes(pathname) || pathname.startsWith("/admin/");
    
    // Preload common data
    useEffect(() => {
        // Preload challenges and rankings data
        const preloadData = async () => {
            try {
                await Promise.all([
                    fetchChallenges(),
                    fetchRankings()
                ]);
            } catch (error) {
                console.error("Error preloading data:", error);
            }
        };
        
        preloadData();
    }, [fetchChallenges, fetchRankings]);

    return (
        <SessionProvider>
            <AuthProvider>
                <UserProfileProvider>
                    <ThemeProvider>
                        {shouldShowNavBarFooter && <NavBar />}
                        {children}
                        {shouldShowNavBarFooter && <Footer />}
                    </ThemeProvider>
                </UserProfileProvider>
                <Toaster position="top-right" />
            </AuthProvider>
        </SessionProvider>
    );
}
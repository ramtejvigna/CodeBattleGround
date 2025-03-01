"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Define the routes where you don't want to show NavBar and Footer
    const noNavBarFooterRoutes = ["/login", "/signup"];

    // Check if the current route is in the noNavBarFooterRoutes array
    const shouldShowNavBarFooter = !noNavBarFooterRoutes.includes(pathname);

    return (
        <SessionProvider>
            <AuthProvider>
                <UserProfileProvider>
                    {shouldShowNavBarFooter && <NavBar />}
                    {children}
                    {shouldShowNavBarFooter && <Footer />}
                </UserProfileProvider>
                <Toaster position="top-right" />
            </AuthProvider>
        </SessionProvider>
    );
}
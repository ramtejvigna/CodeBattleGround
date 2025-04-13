"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Define the routes where you don't want to show NavBar and Footer
    const noNavBarFooterRoutes = ["/login", "/signup", "/admin"];

    // Check if the current route is in the noNavBarFooterRoutes array
    const shouldShowNavBarFooter = !noNavBarFooterRoutes.includes(pathname) || pathname.startsWith("/admin/");

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
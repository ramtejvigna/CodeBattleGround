"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Define the routes where you don't want to show NavBar and Footer
    const noNavBarFooterRoutes = ["/login", "/registration"];

    // Check if the current route is in the noNavBarFooterRoutes array
    const shouldShowNavBarFooter = !noNavBarFooterRoutes.includes(pathname);

    return (
        <>
            {shouldShowNavBarFooter && <NavBar />}
            {children}
            {shouldShowNavBarFooter && <Footer />}
        </>
    );
}
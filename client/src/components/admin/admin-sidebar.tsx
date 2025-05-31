"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart3, Users, Award, Settings, FileCode, Home, LogOut, Shield, Menu, X } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { signOut } from "next-auth/react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function AdminSidebar({ className }: SidebarNavProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { theme } = useTheme()

    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    const navItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: <Home className="mr-2 h-4 w-4" />,
        },
        {
            title: "Analytics",
            href: "/admin/analytics",
            icon: <BarChart3 className="mr-2 h-4 w-4" />,
        },
        {
            title: "Users",
            href: "/admin/users",
            icon: <Users className="mr-2 h-4 w-4" />,
        },
        {
            title: "Challenges",
            href: "/admin/challenges",
            icon: <FileCode className="mr-2 h-4 w-4" />,
        },
        {
            title: "Certifications",
            href: "/admin/certifications",
            icon: <Award className="mr-2 h-4 w-4" />,
        },
        {
            title: "Permissions",
            href: "/admin/permissions",
            icon: <Shield className="mr-2 h-4 w-4" />,
        },
        {
            title: "Settings",
            href: "/admin/settings",
            icon: <Settings className="mr-2 h-4 w-4" />,
        },
    ]

    return (
        <>
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Sidebar */}
            <div
                className={cn(
                    "w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900",
                    "border-r",
                    className,
                )}
            >
                <div className="flex h-16 items-center justify-center border-b px-4">
                    <Link href="/" className="flex items-center justify-center">
                        <h1 className="cursor-pointer uppercase font-[family-name:var(--font-kanit-sans)] flex flex-col select-none">
                            <span className="text-[9px] leading-[9px] self-start tracking-wider text-gray-400">Code</span>
                            <span className="bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-2xl py-1 bg-clip-text text-transparent leading-[12px] font-extrabold tracking-wide scale-y-75 transform origin-top">
                                Battle
                            </span>
                            <span className="text-[9px] leading-[0] self-end tracking-wider text-gray-400">Ground</span>
                        </h1>
                    </Link>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Admin Panel
                        </h2>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start",
                                        pathname === item.href ? "bg-muted font-medium" : "font-normal",
                                    )}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        {item.icon}
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                        <div className="mt-6">
                            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Actions
                            </h2>
                            <div className="space-y-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start font-normal text-red-500 hover:text-red-600 hover:bg-red-100/20"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </>
    )
}


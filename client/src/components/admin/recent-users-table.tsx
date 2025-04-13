"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye } from "lucide-react"

interface User {
    id: string
    username: string
    email: string
    image: string | null
    role: string
    createdAt: string
    userProfile: {
        level: number
        points: number
    } | null
}

export function RecentUsersTable() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecentUsers = async () => {
            try {
                const response = await fetch("/api/admin/users/recent")
                const data = await response.json()

                if (data.success) {
                    setUsers(data.users)
                }
            } catch (error) {
                console.error("Error fetching recent users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentUsers()
    }, [])

    // Fallback data for preview
    const fallbackUsers: User[] = Array.from({ length: 5 }, (_, i) => ({
        id: `user-${i}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        image: null,
        role: i === 0 ? "ADMIN" : "USER",
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        userProfile: {
            level: Math.floor(Math.random() * 10) + 1,
            points: Math.floor(Math.random() * 1000)
        }
    }));

    const displayUsers = loading ? [] : users.length > 0 ? users : fallbackUsers

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))
                        : displayUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.image || undefined} alt={user.username} />
                                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                    >
                                        Level {user.userProfile?.level || 1}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={`/admin/users/${user.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View user</span>
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}


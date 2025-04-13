"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, ChevronDown, Search, Edit, Trash, Shield, Ban, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
    id: string
    name: string | null
    username: string
    email: string
    image: string | null
    role: string
    status: string
    createdAt: string
    lastActive: string
    userProfile: {
        level: number
        points: number
        rank: number
        solved: number
    } | null
}

interface UsersTableProps {
    filter?: string
}

export default function UsersTable({ filter = "all" }: UsersTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortColumn, setSortColumn] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/users?page=${currentPage}&sort=${sortColumn}&direction=${sortDirection}&filter=${filter}&search=${searchTerm}`);
                const data = await response.json();

                if (data.success) {
                    setUsers(data.users);
                    setTotalPages(data.totalPages);
                } else {
                    console.error("Failed to fetch users:", data.message);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, sortColumn, sortDirection, filter, searchTerm]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Badge className="bg-red-500">Admin</Badge>;
            case "MODERATOR":
                return <Badge className="bg-blue-500">Moderator</Badge>;
            default:
                return <Badge variant="outline">User</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500">Active</Badge>;
            case "INACTIVE":
                return <Badge variant="secondary">Inactive</Badge>;
            case "SUSPENDED":
                return <Badge className="bg-yellow-500">Suspended</Badge>;
            case "BANNED":
                return <Badge className="bg-red-500">Banned</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("username")}
                                    className="flex items-center gap-1 p-0 font-medium"
                                >
                                    User
                                    {sortColumn === "username" && (
                                        <ChevronDown
                                            className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""
                                                } transition-transform`}
                                        />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("role")}
                                    className="flex items-center gap-1 p-0 font-medium"
                                >
                                    Role
                                    {sortColumn === "role" && (
                                        <ChevronDown
                                            className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""
                                                } transition-transform`}
                                        />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("status")}
                                    className="flex items-center gap-1 p-0 font-medium"
                                >
                                    Status
                                    {sortColumn === "status" && (
                                        <ChevronDown
                                            className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""
                                                } transition-transform`}
                                        />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("createdAt")}
                                    className="flex items-center gap-1 p-0 font-medium"
                                >
                                    Joined
                                    {sortColumn === "createdAt" && (
                                        <ChevronDown
                                            className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""
                                                } transition-transform`}
                                        />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("lastActive")}
                                    className="flex items-center gap-1 p-0 font-medium"
                                >
                                    Last Active
                                    {sortColumn === "lastActive" && (
                                        <ChevronDown
                                            className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""
                                                } transition-transform`}
                                        />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
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
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {user.lastActive
                                            ? new Date(user.lastActive).toLocaleDateString()
                                            : "Never"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    {user.status === "BANNED" ? "Unban User" : "Ban User"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(pageNumber);
                                    }}
                                    isActive={currentPage === pageNumber}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                    {totalPages > 5 && (
                        <>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(totalPages);
                                    }}
                                    isActive={currentPage === totalPages}
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}


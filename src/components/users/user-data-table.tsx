"use client"

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Mail,
    Phone,
    Calendar,
    RotateCcw
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    phone?: string
    isActive: boolean
    deletedAt?: string | null
    deletedBy?: string | null
    createdAt: string
    updatedAt: string
    role: {
        id: string
        name: string
        description?: string
    }
    shops: Array<{
        id: string
        name: string
    }>
    _count: {
        sales: number
    }
}

interface UserDataTableProps {
    users: User[]
    loading: boolean
    currentPage: number
    totalPages: number
    totalUsers?: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onEdit: (user: User) => void
    onView: (user: User) => void
    onDelete: (user: User) => void
    onRestore?: (user: User) => void
}

export function UserDataTable({
    users,
    loading,
    currentPage,
    totalPages,
    totalUsers = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onView,
    onDelete,
    onRestore
}: UserDataTableProps) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const getRoleColor = (roleName: string) => {
        const colors: Record<string, string> = {
            'ADMIN': 'bg-red-100 text-red-800 border-red-200',
            'MANAGER': 'bg-blue-100 text-blue-800 border-blue-200',
            'CASHIER': 'bg-green-100 text-green-800 border-green-200',
            'STAFF': 'bg-gray-100 text-gray-800 border-gray-200',
        }
        return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No users match your current filters.
                </p>
            </div>
        )
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Shops</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                                            {getInitials(user.firstName, user.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                        {user.email}
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                            {user.phone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge className={getRoleColor(user.role.name)}>
                                    {user.role.name}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1">
                                    {user.shops.length > 0 ? (
                                        user.shops.slice(0, 2).map((shop) => (
                                            <Badge key={shop.id} variant="outline" className="text-xs">
                                                {shop.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">No shops assigned</span>
                                    )}
                                    {user.shops.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{user.shops.length - 2} more
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="text-sm font-medium text-gray-900">
                                    {user._count.sales}
                                </div>
                                <div className="text-xs text-gray-500">sales</div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Badge
                                        variant={user.isActive ? "default" : "secondary"}
                                        className={user.isActive
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                        }
                                    >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {user.deletedAt && (
                                        <Badge variant="destructive" className="text-xs">
                                            Deleted
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                </div>
                            </TableCell>

                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onView(user)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        {!user.deletedAt && (
                                            <>
                                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(user)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {user.deletedAt && onRestore && (
                                            <DropdownMenuItem
                                                onClick={() => onRestore(user)}
                                                className="text-green-600"
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Restore User
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
                        <span className="font-medium">{totalUsers}</span> users
                    </div>

                    {onPageSizeChange && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-600">entries</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* First Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex"
                    >
                        First
                    </Button>

                    {/* Previous */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNumber)}
                                    className={`w-10 h-10 p-0 ${currentPage === pageNumber
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "hover:bg-gray-100"
                                        }`}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Next */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:flex"
                    >
                        Last
                    </Button>
                </div>
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Search,
    Users,
    UserCheck,
    UserX
} from 'lucide-react'
import { UserDialog } from '@/components/users/user-dialog'
import { DeleteUserDialog } from '@/components/users/delete-user-dialog'
import { UserDataTable } from '@/components/users/user-data-table'
import { toast } from 'sonner'

interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    phone?: string
    isActive: boolean
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

interface Role {
    id: string
    name: string
    description?: string
}

interface Shop {
    id: string
    name: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [showDeleted, setShowDeleted] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedRole && { roleId: selectedRole }),
                ...(statusFilter && { isActive: statusFilter }),
                ...(showDeleted && { includeDeleted: 'true' })
            })

            const response = await fetch(`/api/users?${params}`)
            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data.users)
            setTotalPages(data.pagination.pages)
            setTotalUsers(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles')
            if (!response.ok) throw new Error('Failed to fetch roles')
            const data = await response.json()
            setRoles(data.roles || [])
        } catch (error) {
            console.error('Error fetching roles:', error)
            setRoles([])
        }
    }

    const fetchShops = async () => {
        try {
            const response = await fetch('/api/shops')
            if (!response.ok) throw new Error('Failed to fetch shops')
            const data = await response.json()
            setShops(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching shops:', error)
            setShops([])
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchRoles()
        fetchShops()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchUsers(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedRole, statusFilter, showDeleted, pageSize])

    const handleCreateUser = () => {
        setSelectedUser(null)
        setDialogMode('create')
        setIsUserDialogOpen(true)
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setDialogMode('edit')
        setIsUserDialogOpen(true)
    }

    const handleViewUser = (user: User) => {
        setSelectedUser(user)
        setDialogMode('view')
        setIsUserDialogOpen(true)
    }

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    const handleUserSaved = () => {
        fetchUsers(currentPage)
        setIsUserDialogOpen(false)
    }

    const handleUserDeleted = () => {
        fetchUsers(currentPage)
        setIsDeleteDialogOpen(false)
    }

    const handleRestoreUser = async (user: User) => {
        try {
            const response = await fetch(`/api/users/${user.id}/restore`, {
                method: 'POST',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to restore user')
            }

            toast.success('User restored successfully')
            fetchUsers(currentPage)
        } catch (error) {
            console.error('Error restoring user:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to restore user')
        }
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // Reset to first page when changing page size
        // fetchUsers will be called by useEffect when pageSize changes
    }



    const activeUsers = users.filter(user => user.isActive).length
    const inactiveUsers = users.filter(user => !user.isActive).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    User Management
                                </h1>
                                <p className="text-gray-600">Manage system users and their permissions</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateUser}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New User
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                                <p className="text-xs text-gray-500">All registered users</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Active Users</p>
                                <p className="text-2xl font-semibold text-emerald-600">{activeUsers}</p>
                                <p className="text-xs text-gray-500">Currently active</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl">
                                <UserCheck className="h-8 w-8 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                                <p className="text-2xl font-semibold text-red-600">{inactiveUsers}</p>
                                <p className="text-xs text-gray-500">Deactivated accounts</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl">
                                <UserX className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search users by name, email, or username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200 min-w-48"
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200 min-w-48"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>

                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 border border-gray-200 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="showDeleted"
                                    checked={showDeleted}
                                    onChange={(e) => setShowDeleted(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="showDeleted" className="text-sm text-gray-700 cursor-pointer">
                                    Show deleted users
                                </label>
                            </div>

                            {(searchTerm || selectedRole || statusFilter || showDeleted) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSelectedRole('')
                                        setStatusFilter('')
                                        setShowDeleted(false)
                                    }}
                                    className="h-12 px-6 bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                    <UserDataTable
                        users={users}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalUsers={totalUsers}
                        pageSize={pageSize}
                        onPageChange={fetchUsers}
                        onPageSizeChange={handlePageSizeChange}
                        onEdit={handleEditUser}
                        onView={handleViewUser}
                        onDelete={handleDeleteUser}
                        onRestore={handleRestoreUser}
                    />
                </div>

                {/* Dialogs */}
                <UserDialog
                    open={isUserDialogOpen}
                    onOpenChange={setIsUserDialogOpen}
                    user={selectedUser}
                    mode={dialogMode}
                    roles={roles}
                    shops={shops}
                    onSave={handleUserSaved}
                />

                <DeleteUserDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    user={selectedUser}
                    onDelete={handleUserDeleted}
                />
            </div>
        </div>
    )
}
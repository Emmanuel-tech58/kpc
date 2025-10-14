"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Plus,
    Search,
    Shield,
    Users,
    Settings
} from 'lucide-react'
import { RoleDataTable } from '@/components/roles/role-data-table'
import { RoleDialog } from '@/components/roles/role-dialog'
import { DeleteRoleDialog } from '@/components/roles/delete-role-dialog'
import { toast } from 'sonner'

interface Role {
    id: string
    name: string
    description?: string
    permissions: Record<string, string[]>
    createdAt: string
    updatedAt: string
    _count: {
        users: number
    }
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalRoles, setTotalRoles] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchRoles = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm })
            })

            const response = await fetch(`/api/roles?${params}`)
            if (!response.ok) throw new Error('Failed to fetch roles')

            const data = await response.json()
            setRoles(data.roles)
            setTotalPages(data.pagination.pages)
            setTotalRoles(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching roles:', error)
            toast.error('Failed to fetch roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchRoles(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, pageSize])

    const handleCreateRole = () => {
        setSelectedRole(null)
        setDialogMode('create')
        setIsRoleDialogOpen(true)
    }

    const handleEditRole = (role: Role) => {
        setSelectedRole(role)
        setDialogMode('edit')
        setIsRoleDialogOpen(true)
    }

    const handleViewRole = (role: Role) => {
        setSelectedRole(role)
        setDialogMode('view')
        setIsRoleDialogOpen(true)
    }

    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role)
        setIsDeleteDialogOpen(true)
    }

    const handleRoleSaved = () => {
        fetchRoles(currentPage)
        setIsRoleDialogOpen(false)
    }

    const handleRoleDeleted = () => {
        fetchRoles(currentPage)
        setIsDeleteDialogOpen(false)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Role Management
                                </h1>
                                <p className="text-gray-600">Manage user roles and permissions</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateRole}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Role
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                                <p className="text-2xl font-semibold text-gray-900">{totalRoles}</p>
                                <p className="text-xs text-gray-500">System roles</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                                <Shield className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Assigned Users</p>
                                <p className="text-2xl font-semibold text-blue-600">
                                    {roles.reduce((sum, role) => sum + role._count.users, 0)}
                                </p>
                                <p className="text-xs text-gray-500">Users with roles</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Permissions</p>
                                <p className="text-2xl font-semibold text-green-600">
                                    {roles.reduce((sum, role) => sum + Object.keys(role.permissions || {}).length, 0)}
                                </p>
                                <p className="text-xs text-gray-500">Total permissions</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                <Settings className="h-8 w-8 text-green-600" />
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
                                    placeholder="Search roles by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"
                                />
                            </div>
                        </div>

                        {searchTerm && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchTerm('')}
                                className="h-12 px-6 bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                    <RoleDataTable
                        roles={roles}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRoles={totalRoles}
                        pageSize={pageSize}
                        onPageChange={fetchRoles}
                        onPageSizeChange={handlePageSizeChange}
                        onEdit={handleEditRole}
                        onView={handleViewRole}
                        onDelete={handleDeleteRole}
                    />
                </div>

                {/* Dialogs */}
                <RoleDialog
                    open={isRoleDialogOpen}
                    onOpenChange={setIsRoleDialogOpen}
                    role={selectedRole}
                    mode={dialogMode}
                    onSave={handleRoleSaved}
                />

                <DeleteRoleDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    role={selectedRole}
                    onDelete={handleRoleDeleted}
                />
            </div>
        </div>
    )
}
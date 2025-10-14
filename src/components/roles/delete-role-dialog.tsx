"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    X,
    Shield,
    Users,
    Trash2
} from 'lucide-react'
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

interface DeleteRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    onDelete: () => void
}

export function DeleteRoleDialog({
    open,
    onOpenChange,
    role,
    onDelete
}: DeleteRoleDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!role) return

        try {
            setLoading(true)

            const response = await fetch(`/api/roles/${role.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete role')
            }

            toast.success('Role deleted successfully')
            onDelete()
        } catch (error) {
            console.error('Error deleting role:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete role')
        } finally {
            setLoading(false)
        }
    }

    if (!open || !role) return null

    const hasUsers = role._count.users > 0

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Role
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Role Info */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{role.name}</h3>
                            {role.description && (
                                <p className="text-sm text-gray-600">{role.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {role._count.users} {role._count.users === 1 ? 'user' : 'users'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {hasUsers ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Cannot Delete Role</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        This role is currently assigned to {role._count.users} user{role._count.users === 1 ? '' : 's'}.
                                        Please reassign or remove these users before deleting the role.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-800">Confirm Deletion</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Are you sure you want to delete this role? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 p-6 border-t border-gray-200/50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    {!hasUsers && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? (
                                'Deleting...'
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Role
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
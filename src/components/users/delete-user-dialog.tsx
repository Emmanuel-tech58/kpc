"use client"

import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertTriangle, User, Trash2 } from 'lucide-react'
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

interface DeleteUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onDelete: () => void
}

export function DeleteUserDialog({
    open,
    onOpenChange,
    user,
    onDelete
}: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false)

    if (!user) return null

    const handleDelete = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }

            const result = await response.json()

            if (result.message?.includes('deactivated')) {
                toast.success('User has been deactivated due to existing records')
            } else {
                toast.success('User deleted successfully')
            }

            onDelete()
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete user')
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const hasAssociatedRecords = user._count.sales > 0
    const actionText = hasAssociatedRecords ? 'deactivate' : 'delete'
    const actionPastTense = hasAssociatedRecords ? 'deactivated' : 'deleted'

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {hasAssociatedRecords ? 'Deactivate User' : 'Delete User'}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <p>
                                {hasAssociatedRecords
                                    ? `This user has associated sales records and cannot be permanently deleted. The user will be deactivated instead.`
                                    : `Are you sure you want to delete this user? This action cannot be undone.`
                                }
                            </p>

                            {/* User Info Card */}
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-inventory-pink/20 to-inventory-purple/20 text-inventory-pink font-medium">
                                        {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                            {user.role.name}
                                        </Badge>
                                        <Badge
                                            className={user.isActive
                                                ? "bg-green-100 text-green-800 text-xs"
                                                : "bg-red-100 text-red-800 text-xs"
                                            }
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Associated Records Warning */}
                            {hasAssociatedRecords && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-800">Associated Records Found</h4>
                                            <div className="text-sm text-yellow-700 mt-1 space-y-1">
                                                <p>• {user._count.sales} sales transactions</p>
                                                <p className="mt-2">
                                                    The user will be deactivated to preserve data integrity.
                                                    You can reactivate the user later if needed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shop Access Info */}
                            {user.shops.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Current Shop Access:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {user.shops.map((shop) => (
                                            <Badge key={shop.id} variant="outline" className="text-xs">
                                                {shop.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className={hasAssociatedRecords
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-red-600 hover:bg-red-700"
                        }
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {hasAssociatedRecords ? 'Deactivating...' : 'Deleting...'}
                            </>
                        ) : (
                            <>
                                {hasAssociatedRecords ? (
                                    <User className="h-4 w-4 mr-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {hasAssociatedRecords ? 'Deactivate User' : 'Delete User'}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
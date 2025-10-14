"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    X,
    FolderOpen,
    Package,
    Trash2,
    Folder
} from 'lucide-react'
import { toast } from 'sonner'

interface Category {
    id: string
    name: string
    description?: string
    parentId?: string
    createdAt: string
    updatedAt: string
    parent?: {
        id: string
        name: string
    }
    children?: Array<{
        id: string
        name: string
    }>
    _count: {
        products: number
        children: number
    }
}

interface DeleteCategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: Category | null
    onDelete: () => void
}

export function DeleteCategoryDialog({
    open,
    onOpenChange,
    category,
    onDelete
}: DeleteCategoryDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!category) return

        try {
            setLoading(true)

            const response = await fetch(`/api/categories/${category.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete category')
            }

            toast.success('Category deleted successfully')
            onDelete()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete category')
        } finally {
            setLoading(false)
        }
    }

    if (!open || !category) return null

    const hasContent = category._count.products > 0 || category._count.children > 0

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Category
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
                    {/* Category Info */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                            {category._count.children > 0 ? (
                                <FolderOpen className="h-5 w-5 text-orange-600" />
                            ) : (
                                <Folder className="h-5 w-5 text-orange-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.description && (
                                <p className="text-sm text-gray-600">{category.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                {category.parent ? (
                                    <Badge variant="outline" className="text-xs">
                                        Parent: {category.parent.name}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Root Category
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {hasContent ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Cannot Delete Category</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        This category cannot be deleted because it contains:
                                    </p>
                                    <ul className="text-sm text-red-700 mt-2 space-y-1">
                                        {category._count.products > 0 && (
                                            <li className="flex items-center gap-2">
                                                <Package className="h-3 w-3" />
                                                {category._count.products} product{category._count.products === 1 ? '' : 's'}
                                            </li>
                                        )}
                                        {category._count.children > 0 && (
                                            <li className="flex items-center gap-2">
                                                <FolderOpen className="h-3 w-3" />
                                                {category._count.children} subcategor{category._count.children === 1 ? 'y' : 'ies'}
                                            </li>
                                        )}
                                    </ul>
                                    <p className="text-sm text-red-700 mt-2 font-medium">
                                        Please move or delete the contents first, then try again.
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
                                        Are you sure you want to delete this category? This action cannot be undone.
                                    </p>
                                    <p className="text-sm text-amber-700 mt-2">
                                        The category "{category.name}" will be permanently removed from the system.
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
                    {!hasContent && (
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
                                    Delete Category
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
    FolderOpen,
    X,
    Package,
    Calendar,
    ChevronRight,
    Folder
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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
        _count?: {
            products: number
            children: number
        }
    }>
    products?: Array<{
        id: string
        name: string
        sku?: string
        isActive: boolean
    }>
    _count: {
        products: number
        children: number
    }
}

interface ParentCategory {
    id: string
    name: string
    parentId?: string
}

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: Category | null
    mode: 'create' | 'edit' | 'view'
    parentCategories: ParentCategory[]
    onSave: () => void
}

interface FormData {
    name: string
    description: string
    parentId: string
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    mode,
    parentCategories,
    onSave
}: CategoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        parentId: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (category && (mode === 'edit' || mode === 'view')) {
            setFormData({
                name: category.name,
                description: category.description || '',
                parentId: category.parentId || ''
            })
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                parentId: ''
            })
        }
        setErrors({})
    }, [category, mode])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Category name is required'
        else if (formData.name.length < 2) newErrors.name = 'Category name must be at least 2 characters'

        // Prevent setting parent to self
        if (category && formData.parentId === category.id) {
            newErrors.parentId = 'Category cannot be its own parent'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const url = mode === 'create' ? '/api/categories' : `/api/categories/${category?.id}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const submitData = {
                ...formData,
                parentId: formData.parentId || null,
                description: formData.description.trim() || null
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save category')
            }

            toast.success(mode === 'create' ? 'Category created successfully' : 'Category updated successfully')
            onSave()
        } catch (error) {
            console.error('Error saving category:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save category')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Create New Category'
            case 'edit': return 'Edit Category'
            case 'view': return 'Category Details'
            default: return 'Category'
        }
    }

    const getCategoryPath = (category: Category) => {
        const path = []
        if (category.parent) {
            path.push(category.parent.name)
        }
        path.push(category.name)
        return path.join(' > ')
    }

    // Filter out the current category and its descendants from parent options
    const availableParents = parentCategories.filter(parent => {
        if (!category) return true
        return parent.id !== category.id
    })

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                                <FolderOpen className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Create a new category to organize your products.'}
                            {mode === 'edit' && 'Update category information and hierarchy.'}
                            {mode === 'view' && 'View category details and associated products.'}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    {mode === 'view' && category ? (
                        <div className="space-y-6">
                            {/* Category Basic Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                                    {category._count.children > 0 ? (
                                        <FolderOpen className="h-8 w-8 text-orange-600" />
                                    ) : (
                                        <Folder className="h-8 w-8 text-orange-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                                    {category.description && (
                                        <p className="text-gray-600 mt-1">{category.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="text-sm text-gray-500">
                                            Path: {getCategoryPath(category)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Hierarchy */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4" />
                                    Hierarchy
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Parent Category</label>
                                        {category.parent ? (
                                            <Badge className="bg-blue-100 text-blue-800 mt-1">
                                                {category.parent.name}
                                            </Badge>
                                        ) : (
                                            <p className="text-gray-500 italic mt-1">Root Category</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Subcategories</label>
                                        <p className="text-gray-900 mt-1">{category._count.children}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Subcategories */}
                            {category.children && category.children.length > 0 && (
                                <>
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Subcategories</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {category.children.map((child) => (
                                                <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Folder className="h-4 w-4 text-orange-600" />
                                                        <span className="font-medium text-gray-900">{child.name}</span>
                                                    </div>
                                                    {child._count && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {child._count.products} products
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Products */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Products ({category._count.products})
                                </h4>
                                {category.products && category.products.length > 0 ? (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {category.products.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    {product.sku && (
                                                        <p className="text-sm text-gray-500 font-mono">SKU: {product.sku}</p>
                                                    )}
                                                </div>
                                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                        <p className="text-gray-600">No products in this category</p>
                                        <p className="text-sm text-gray-500">Products will appear here when added</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Activity Info */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Activity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created</label>
                                        <p className="text-gray-900">{format(new Date(category.createdAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-gray-900">{format(new Date(category.updatedAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Basic Information</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category Name *
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter category name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Enter category description"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Hierarchy */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Category Hierarchy</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Category (Optional)
                                    </label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(e) => handleInputChange('parentId', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.parentId ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">No Parent (Root Category)</option>
                                        {availableParents.map((parent) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parentId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.parentId}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Select a parent category to create a subcategory, or leave empty for a root category.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700"
                                >
                                    {loading ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Update Category'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                {mode === 'view' && (
                    <div className="flex justify-end space-x-2 p-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
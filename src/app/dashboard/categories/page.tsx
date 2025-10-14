"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Plus,
    Search,
    FolderOpen,
    Package,
    Folder,
    TreePine
} from 'lucide-react'
import { CategoryDataTable } from '@/components/categories/category-data-table'
import { CategoryDialog } from '@/components/categories/category-dialog'
import { DeleteCategoryDialog } from '@/components/categories/delete-category-dialog'
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

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [parentFilter, setParentFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCategories, setTotalCategories] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchCategories = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(parentFilter && { parentId: parentFilter })
            })

            const response = await fetch(`/api/categories?${params}`)
            if (!response.ok) throw new Error('Failed to fetch categories')

            const data = await response.json()
            setCategories(data.categories || [])
            setTotalPages(data.pagination.pages)
            setTotalCategories(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to fetch categories')
            setCategories([])
        } finally {
            setLoading(false)
        }
    }

    const fetchParentCategories = async () => {
        try {
            // Fetch all categories for parent selection (without pagination)
            const response = await fetch('/api/categories?limit=1000')
            if (!response.ok) throw new Error('Failed to fetch parent categories')
            const data = await response.json()
            setParentCategories(data.categories || [])
        } catch (error) {
            console.error('Error fetching parent categories:', error)
            setParentCategories([])
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchParentCategories()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchCategories(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, parentFilter, pageSize])

    const handleCreateCategory = () => {
        setSelectedCategory(null)
        setDialogMode('create')
        setIsCategoryDialogOpen(true)
    }

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category)
        setDialogMode('edit')
        setIsCategoryDialogOpen(true)
    }

    const handleViewCategory = async (category: Category) => {
        try {
            // Fetch full category details including products
            const response = await fetch(`/api/categories/${category.id}`)
            if (!response.ok) throw new Error('Failed to fetch category details')

            const fullCategory = await response.json()
            setSelectedCategory(fullCategory)
            setDialogMode('view')
            setIsCategoryDialogOpen(true)
        } catch (error) {
            console.error('Error fetching category details:', error)
            toast.error('Failed to load category details')
        }
    }

    const handleDeleteCategory = (category: Category) => {
        setSelectedCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const handleCategorySaved = () => {
        fetchCategories(currentPage)
        fetchParentCategories() // Refresh parent categories list
        setIsCategoryDialogOpen(false)
    }

    const handleCategoryDeleted = () => {
        fetchCategories(currentPage)
        fetchParentCategories() // Refresh parent categories list
        setIsDeleteDialogOpen(false)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setParentFilter('')
    }

    // Calculate stats
    const rootCategories = categories.filter(c => !c.parent).length
    const subcategories = categories.filter(c => c.parent).length
    const totalProducts = categories.reduce((sum, cat) => sum + cat._count.products, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                                <FolderOpen className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Category Management
                                </h1>
                                <p className="text-gray-600">Organize your products with categories and subcategories</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateCategory}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Category
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                                <p className="text-2xl font-semibold text-gray-900">{totalCategories}</p>
                                <p className="text-xs text-gray-500">All categories</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl">
                                <FolderOpen className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Root Categories</p>
                                <p className="text-2xl font-semibold text-blue-600">{rootCategories}</p>
                                <p className="text-xs text-gray-500">Top-level categories</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                                <TreePine className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Products Organized</p>
                                <p className="text-2xl font-semibold text-green-600">{totalProducts}</p>
                                <p className="text-xs text-gray-500">Across all categories</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                <Package className="h-8 w-8 text-green-600" />
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
                                    placeholder="Search categories by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-orange-300 focus:ring-orange-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={parentFilter}
                                onChange={(e) => setParentFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-orange-300 focus:ring-orange-200 min-w-48"
                            >
                                <option value="">All Categories</option>
                                <option value="null">Root Categories Only</option>
                                {parentCategories
                                    .filter(cat => !cat.parentId) // Only show root categories as filter options
                                    .map((category) => (
                                        <option key={category.id} value={category.id}>
                                            Subcategories of {category.name}
                                        </option>
                                    ))}
                            </select>

                            {(searchTerm || parentFilter) && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
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
                    <CategoryDataTable
                        categories={categories}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCategories={totalCategories}
                        pageSize={pageSize}
                        onPageChange={fetchCategories}
                        onPageSizeChange={handlePageSizeChange}
                        onEdit={handleEditCategory}
                        onView={handleViewCategory}
                        onDelete={handleDeleteCategory}
                    />
                </div>

                {/* Dialogs */}
                <CategoryDialog
                    open={isCategoryDialogOpen}
                    onOpenChange={setIsCategoryDialogOpen}
                    category={selectedCategory}
                    mode={dialogMode}
                    parentCategories={parentCategories}
                    onSave={handleCategorySaved}
                />

                <DeleteCategoryDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    category={selectedCategory}
                    onDelete={handleCategoryDeleted}
                />
            </div>
        </div>
    )
}
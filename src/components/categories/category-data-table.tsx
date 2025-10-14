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
    FolderOpen,
    Package,
    Calendar,
    ChevronRight as ChevronRightIcon,
    Folder
} from 'lucide-react'
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
    }>
    _count: {
        products: number
        children: number
    }
}

interface CategoryDataTableProps {
    categories: Category[]
    loading: boolean
    currentPage: number
    totalPages: number
    totalCategories?: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onEdit: (category: Category) => void
    onView: (category: Category) => void
    onDelete: (category: Category) => void
}

export function CategoryDataTable({
    categories,
    loading,
    currentPage,
    totalPages,
    totalCategories = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onView,
    onDelete
}: CategoryDataTableProps) {
    const getCategoryLevel = (category: Category) => {
        return category.parent ? 1 : 0 // Simple level calculation
    }

    const getCategoryIcon = (category: Category) => {
        if (category._count.children > 0) {
            return <FolderOpen className="h-5 w-5 text-blue-600" />
        }
        return <Folder className="h-5 w-5 text-gray-600" />
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                            <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (categories.length === 0) {
        return (
            <div className="p-8 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No categories match your current search.
                </p>
            </div>
        )
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Subcategories</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => {
                        const level = getCategoryLevel(category)

                        return (
                            <TableRow key={category.id} className="hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                                            {getCategoryIcon(category)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {level > 0 && (
                                                    <div className="flex items-center text-gray-400">
                                                        <ChevronRightIcon className="h-3 w-3" />
                                                    </div>
                                                )}
                                                <div className="font-medium text-gray-900">{category.name}</div>
                                            </div>
                                            {category._count.children > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Has subcategories
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="max-w-xs">
                                        {category.description ? (
                                            <p className="text-sm text-gray-900 truncate">{category.description}</p>
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">No description</span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {category.parent ? (
                                        <Badge variant="outline" className="text-xs">
                                            {category.parent.name}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                            Root Category
                                        </Badge>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {category._count.products}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {category._count.products === 1 ? 'product' : 'products'}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <FolderOpen className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {category._count.children}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {category._count.children === 1 ? 'subcategory' : 'subcategories'}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(category.createdAt), 'MMM dd, yyyy')}
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
                                            <DropdownMenuItem onClick={() => onView(category)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Category
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(category)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Category
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalCategories)}</span> of{' '}
                        <span className="font-medium">{totalCategories}</span> categories
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
                                        ? "bg-orange-600 text-white hover:bg-orange-700"
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
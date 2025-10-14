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
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calendar,
    Barcode,
    Tag
} from 'lucide-react'
import { format } from 'date-fns'

interface Product {
    id: string
    name: string
    description?: string
    sku?: string
    barcode?: string
    brand?: string
    unit: string
    minStock: number
    maxStock?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    category: {
        id: string
        name: string
    }
    supplier: {
        id: string
        name: string
    }
    inventory: Array<{
        id: string
        quantity: number
        reservedQty: number
        costPrice: number
        sellingPrice: number
        shop: {
            id: string
            name: string
        }
    }>
    _count: {
        saleItems: number
        purchaseItems: number
    }
}

interface ProductDataTableProps {
    products: Product[]
    loading: boolean
    currentPage: number
    totalPages: number
    totalProducts?: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onEdit: (product: Product) => void
    onView: (product: Product) => void
    onDelete: (product: Product) => void
}

export function ProductDataTable({
    products,
    loading,
    currentPage,
    totalPages,
    totalProducts = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onView,
    onDelete
}: ProductDataTableProps) {
    const getTotalStock = (inventory: Product['inventory']) => {
        return inventory.reduce((total, inv) => total + inv.quantity, 0)
    }

    const getStockStatus = (product: Product) => {
        const totalStock = getTotalStock(product.inventory)

        if (totalStock === 0) {
            return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' }
        } else if (totalStock <= product.minStock) {
            return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
        } else {
            return { status: 'in-stock', label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' }
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'out-of-stock':
                return <XCircle className="h-3 w-3" />
            case 'low-stock':
                return <AlertTriangle className="h-3 w-3" />
            case 'in-stock':
                return <CheckCircle className="h-3 w-3" />
            default:
                return null
        }
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

    if (products.length === 0) {
        return (
            <div className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No products match your current search.
                </p>
            </div>
        )
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU/Barcode</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product)
                        const totalStock = getTotalStock(product.inventory)

                        return (
                            <TableRow key={product.id} className="hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            {product.brand && (
                                                <div className="text-sm text-gray-500">{product.brand}</div>
                                            )}
                                            <div className="text-xs text-gray-400">{product.unit}</div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        {product.sku ? (
                                            <div className="flex items-center text-sm font-mono text-gray-900">
                                                <Tag className="h-3 w-3 mr-1 text-gray-400" />
                                                {product.sku}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-gray-500 italic">
                                                <Tag className="h-3 w-3 mr-1 text-gray-400" />
                                                No SKU
                                            </div>
                                        )}
                                        {product.barcode && (
                                            <div className="flex items-center text-sm font-mono text-gray-500">
                                                <Barcode className="h-3 w-3 mr-1 text-gray-400" />
                                                {product.barcode}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {product.category.name}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="text-sm text-gray-900">{product.supplier.name}</div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {totalStock} {product.unit}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Min: {product.minStock}
                                            {product.maxStock && ` | Max: ${product.maxStock}`}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge className={stockStatus.color}>
                                            {getStatusIcon(stockStatus.status)}
                                            <span className="ml-1">{stockStatus.label}</span>
                                        </Badge>
                                        <Badge
                                            variant={product.isActive ? "default" : "secondary"}
                                            className={product.isActive
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                            }
                                        >
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="text-sm font-medium text-gray-900">
                                        {product._count.saleItems}
                                    </div>
                                    <div className="text-xs text-gray-500">sales</div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(product.createdAt), 'MMM dd, yyyy')}
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
                                            <DropdownMenuItem onClick={() => onView(product)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(product)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Product
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(product)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Product
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
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalProducts)}</span> of{' '}
                        <span className="font-medium">{totalProducts}</span> products
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
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
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
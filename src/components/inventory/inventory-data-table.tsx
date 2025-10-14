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
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Store,
    DollarSign,
    Calendar
} from 'lucide-react'
import { format } from 'date-fns'

interface InventoryItem {
    id: string
    quantity: number
    reservedQty: number
    costPrice: number
    sellingPrice: number
    lastUpdated: string
    product: {
        id: string
        name: string
        sku?: string
        unit: string
        minStock: number
        maxStock?: number
        category: {
            id: string
            name: string
        }
        supplier: {
            id: string
            name: string
        }
    }
    shop: {
        id: string
        name: string
    }
}

interface InventoryDataTableProps {
    inventory: InventoryItem[]
    loading: boolean
    currentPage: number
    totalPages: number
    totalItems?: number
    pageSize?: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onEdit: (item: InventoryItem) => void
    onView: (item: InventoryItem) => void
    onStockMovement: (item: InventoryItem) => void
}

export function InventoryDataTable({
    inventory,
    loading,
    currentPage,
    totalPages,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onView,
    onStockMovement
}: InventoryDataTableProps) {
    const getStockStatus = (item: InventoryItem) => {
        const availableStock = item.quantity - item.reservedQty

        if (availableStock === 0) {
            return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
        } else if (availableStock <= item.product.minStock) {
            return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle }
        } else {
            return { status: 'in-stock', label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
        }
    }

    const calculateMargin = (costPrice: number, sellingPrice: number) => {
        if (costPrice === 0) return 0
        return ((sellingPrice - costPrice) / costPrice * 100)
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

    if (inventory.length === 0) {
        return (
            <div className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No inventory items match your current search.
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
                        <TableHead>Shop</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventory.map((item) => {
                        const stockStatus = getStockStatus(item)
                        const StatusIcon = stockStatus.icon
                        const margin = calculateMargin(item.costPrice, item.sellingPrice)
                        const availableStock = item.quantity - item.reservedQty

                        return (
                            <TableRow key={item.id} className="hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                                            <Package className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.product.name}</div>
                                            {item.product.sku && (
                                                <div className="text-sm text-gray-500 font-mono">SKU: {item.product.sku}</div>
                                            )}
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {item.product.category.name}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Store className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.shop.name}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {availableStock} {item.product.unit} available
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Total: {item.quantity} | Reserved: {item.reservedQty}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Min: {item.product.minStock} {item.product.unit}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm">
                                            <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                                            <span className="text-gray-600">Cost:</span>
                                            <span className="font-medium text-gray-900 ml-1">${item.costPrice}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                                            <span className="text-gray-600">Sell:</span>
                                            <span className="font-medium text-gray-900 ml-1">${item.sellingPrice}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        className={margin > 0
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : margin < 0
                                                ? "bg-red-100 text-red-800 border-red-200"
                                                : "bg-gray-100 text-gray-800 border-gray-200"
                                        }
                                    >
                                        {margin > 0 ? '+' : ''}{margin.toFixed(1)}%
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Badge className={stockStatus.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {stockStatus.label}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {format(new Date(item.lastUpdated), 'MMM dd, yyyy')}
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
                                            <DropdownMenuItem onClick={() => onView(item)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Pricing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStockMovement(item)}>
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Stock Movement
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
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> items
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
                                        ? "bg-green-600 text-white hover:bg-green-700"
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
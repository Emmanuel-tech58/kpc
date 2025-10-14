"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    Store,
    DollarSign
} from 'lucide-react'
import { InventoryDataTable } from '@/components/inventory/inventory-data-table'
import { InventoryDialog } from '@/components/inventory/inventory-dialog'
import { StockMovementDialog } from '@/components/inventory/stock-movement-dialog'
import { toast } from 'sonner'

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

interface Shop {
    id: string
    name: string
}

interface Category {
    id: string
    name: string
}

export default function InventoryManagementPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [shops, setShops] = useState<Shop[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedShop, setSelectedShop] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [stockFilter, setStockFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false)
    const [isStockMovementDialogOpen, setIsStockMovementDialogOpen] = useState(false)
    const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchInventory = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedShop && { shopId: selectedShop }),
                ...(selectedCategory && { categoryId: selectedCategory }),
                ...(stockFilter === 'low' && { lowStock: 'true' })
            })

            const response = await fetch(`/api/inventory?${params}`)
            if (!response.ok) throw new Error('Failed to fetch inventory')

            const data = await response.json()
            setInventory(data.inventory || [])
            setTotalPages(data.pagination.pages)
            setTotalItems(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching inventory:', error)
            toast.error('Failed to fetch inventory')
            setInventory([])
        } finally {
            setLoading(false)
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

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (!response.ok) throw new Error('Failed to fetch categories')
            const data = await response.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        }
    }

    useEffect(() => {
        fetchInventory()
        fetchShops()
        fetchCategories()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchInventory(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedShop, selectedCategory, stockFilter, pageSize])

    const handleCreateInventory = () => {
        setSelectedInventory(null)
        setDialogMode('create')
        setIsInventoryDialogOpen(true)
    }

    const handleEditInventory = (item: InventoryItem) => {
        setSelectedInventory(item)
        setDialogMode('edit')
        setIsInventoryDialogOpen(true)
    }

    const handleViewInventory = (item: InventoryItem) => {
        setSelectedInventory(item)
        setDialogMode('view')
        setIsInventoryDialogOpen(true)
    }

    const handleStockMovement = (item: InventoryItem) => {
        setSelectedInventory(item)
        setIsStockMovementDialogOpen(true)
    }

    const handleInventorySaved = () => {
        fetchInventory(currentPage)
        setIsInventoryDialogOpen(false)
    }

    const handleStockMovementSaved = () => {
        fetchInventory(currentPage)
        setIsStockMovementDialogOpen(false)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedShop('')
        setSelectedCategory('')
        setStockFilter('')
    }

    // Calculate stats
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
    const lowStockItems = inventory.filter(item => item.quantity <= item.product.minStock).length
    const outOfStockItems = inventory.filter(item => item.quantity === 0).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Inventory Management
                                </h1>
                                <p className="text-gray-600">Manage stock levels, pricing, and movements across all shops</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateInventory}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Inventory Item
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                                <p className="text-2xl font-semibold text-gray-900">MWK{totalValue.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">At cost price</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                <p className="text-2xl font-semibold text-yellow-600">{lowStockItems}</p>
                                <p className="text-xs text-gray-500">Need restocking</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl">
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-semibold text-red-600">{outOfStockItems}</p>
                                <p className="text-xs text-gray-500">Urgent attention</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl">
                                <TrendingUp className="h-8 w-8 text-red-600" />
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
                                    placeholder="Search products by name, SKU, or barcode..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-green-300 focus:ring-green-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-green-300 focus:ring-green-200 min-w-48"
                            >
                                <option value="">All Shops</option>
                                {shops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-green-300 focus:ring-green-200 min-w-48"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-green-300 focus:ring-green-200 min-w-32"
                            >
                                <option value="">All Stock</option>
                                <option value="low">Low Stock</option>
                            </select>

                            {(searchTerm || selectedShop || selectedCategory || stockFilter) && (
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
                    <InventoryDataTable
                        inventory={inventory}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={fetchInventory}
                        onPageSizeChange={handlePageSizeChange}
                        onEdit={handleEditInventory}
                        onView={handleViewInventory}
                        onStockMovement={handleStockMovement}
                    />
                </div>

                {/* Dialogs */}
                <InventoryDialog
                    open={isInventoryDialogOpen}
                    onOpenChange={setIsInventoryDialogOpen}
                    inventory={selectedInventory}
                    mode={dialogMode}
                    shops={shops}
                    onSave={handleInventorySaved}
                />

                <StockMovementDialog
                    open={isStockMovementDialogOpen}
                    onOpenChange={setIsStockMovementDialogOpen}
                    inventory={selectedInventory}
                    onSave={handleStockMovementSaved}
                />
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Search, Filter, Package, Calendar, User, Store } from "lucide-react"
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/pagination'

interface StockMovement {
    id: string
    type: string
    quantity: number
    reason?: string
    reference?: string
    createdAt: string
    product: {
        id: string
        name: string
        sku?: string
        unit: string
    }
    shop: {
        id: string
        name: string
    }
    user: {
        id: string
        firstName: string
        lastName: string
    }
}

interface Shop {
    id: string
    name: string
}

interface Product {
    id: string
    name: string
    sku?: string
}

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [shops, setShops] = useState<Shop[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedShop, setSelectedShop] = useState('')
    const [selectedProduct, setSelectedProduct] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const fetchMovements = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedShop && { shopId: selectedShop }),
                ...(selectedProduct && { productId: selectedProduct }),
                ...(selectedType && { type: selectedType })
            })

            const response = await fetch(`/api/stock-movements?${params}`)
            if (!response.ok) throw new Error('Failed to fetch stock movements')

            const data = await response.json()
            setMovements(data.movements || [])
            setTotalItems(data.pagination?.total || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching stock movements:', error)
            toast.error('Failed to fetch stock movements')
            setMovements([])
        } finally {
            setLoading(false)
        }
    }

    const fetchShops = async () => {
        try {
            const response = await fetch('/api/shops?limit=100')
            if (!response.ok) throw new Error('Failed to fetch shops')
            const data = await response.json()
            setShops(data.shops || [])
        } catch (error) {
            console.error('Error fetching shops:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products?limit=100')
            if (!response.ok) throw new Error('Failed to fetch products')
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    useEffect(() => {
        fetchMovements()
        fetchShops()
        fetchProducts()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchMovements(1)
        }, 500)
        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedShop, selectedProduct, selectedType, pageSize])

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const getMovementTypeIcon = (type: string) => {
        switch (type) {
            case 'IN':
            case 'RETURN':
                return <TrendingUp className="h-4 w-4 text-green-600" />
            case 'OUT':
            case 'DAMAGE':
                return <TrendingDown className="h-4 w-4 text-red-600" />
            default:
                return <Package className="h-4 w-4 text-blue-600" />
        }
    }

    const getMovementTypeColor = (type: string) => {
        switch (type) {
            case 'IN': return 'bg-green-100 text-green-800'
            case 'OUT': return 'bg-red-100 text-red-800'
            case 'ADJUSTMENT': return 'bg-blue-100 text-blue-800'
            case 'TRANSFER': return 'bg-purple-100 text-purple-800'
            case 'RETURN': return 'bg-orange-100 text-orange-800'
            case 'DAMAGE': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getMovementTypeLabel = (type: string) => {
        switch (type) {
            case 'IN': return 'Stock In'
            case 'OUT': return 'Stock Out'
            case 'ADJUSTMENT': return 'Adjustment'
            case 'TRANSFER': return 'Transfer'
            case 'RETURN': return 'Return'
            case 'DAMAGE': return 'Damage'
            default: return type
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
                    <p className="text-muted-foreground">
                        Track all inventory movements and changes
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search movements..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Shops</option>
                    {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                            {shop.name}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Products</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name} {product.sku && `(${product.sku})`}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Types</option>
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="RETURN">Return</option>
                    <option value="DAMAGE">Damage</option>
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stock Movement History</CardTitle>
                    <CardDescription>
                        Complete history of all stock movements and inventory changes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading movements...</p>
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No stock movements found</h3>
                            <p className="mb-4">Stock movements will appear here as inventory changes</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {movements.map((movement) => (
                                <div key={movement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                {getMovementTypeIcon(movement.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{movement.product.name}</h3>
                                                {movement.product.sku && (
                                                    <p className="text-sm text-gray-600">SKU: {movement.product.sku}</p>
                                                )}
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(movement.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-semibold text-lg ${movement.type === 'IN' || movement.type === 'RETURN'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}>
                                                        {movement.type === 'IN' || movement.type === 'RETURN' ? '+' : '-'}
                                                        {movement.quantity} {movement.product.unit}
                                                    </span>
                                                </div>
                                                {movement.reason && (
                                                    <div className="text-sm text-gray-600">
                                                        {movement.reason}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={getMovementTypeColor(movement.type)}>
                                                {getMovementTypeLabel(movement.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1">
                                                <Store className="h-4 w-4" />
                                                <span>{movement.shop.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <User className="h-4 w-4" />
                                                <span>{movement.user.firstName} {movement.user.lastName}</span>
                                            </div>
                                        </div>
                                        {movement.reference && (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                Ref: {movement.reference}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={fetchMovements}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
}
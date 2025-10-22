"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Store, Search, Plus, Eye, Edit, Trash2, MapPin, Phone, Mail, Users, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { toast } from 'sonner'
import { ShopDialog } from '@/components/shops/shop-dialog'
import { Pagination } from '@/components/ui/pagination'
import Link from 'next/link'

interface Shop {
    id: string
    name: string
    address: string
    phone?: string
    email?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    business: {
        id: string
        name: string
    }
    users: {
        user: {
            id: string
            firstName: string
            lastName: string
        }
    }[]
    _count: {
        inventory: number
        sales: number
        stockMovements: number
    }
}

interface Business {
    id: string
    name: string
}

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [includeInactive, setIncludeInactive] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [isShopDialogOpen, setIsShopDialogOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchShops = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(includeInactive && { includeInactive: 'true' })
            })

            const response = await fetch(`/api/shops?${params}`)
            if (!response.ok) throw new Error('Failed to fetch shops')

            const data = await response.json()
            setShops(data.shops || [])
            setTotalItems(data.pagination?.total || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching shops:', error)
            toast.error('Failed to fetch shops')
            setShops([])
        } finally {
            setLoading(false)
        }
    }

    const fetchBusinesses = async () => {
        try {
            const response = await fetch('/api/businesses')
            if (!response.ok) throw new Error('Failed to fetch businesses')
            const data = await response.json()
            setBusinesses(data.businesses || [])
        } catch (error) {
            console.error('Error fetching businesses:', error)
        }
    }

    useEffect(() => {
        fetchShops()
        fetchBusinesses()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchShops(1)
        }, 500)
        return () => clearTimeout(debounceTimer)
    }, [searchTerm, includeInactive, pageSize])

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const handleEditShop = (shop: Shop) => {
        setSelectedShop(shop)
        setDialogMode('edit')
        setIsShopDialogOpen(true)
    }

    const handleNewShop = () => {
        setSelectedShop(null)
        setDialogMode('create')
        setIsShopDialogOpen(true)
    }

    const handleShopSaved = () => {
        fetchShops(currentPage)
        setIsShopDialogOpen(false)
    }

    const handleDeleteShop = async (shop: Shop) => {
        if (!confirm(`Are you sure you want to delete "${shop.name}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/shops/${shop.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete shop')
            }

            const result = await response.json()
            toast.success(result.message || 'Shop deleted successfully')
            fetchShops(currentPage)
        } catch (error) {
            console.error('Error deleting shop:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete shop')
        }
    }

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
                    <p className="text-muted-foreground">
                        Manage your business locations and shop information
                    </p>
                </div>
                <Button onClick={handleNewShop}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shop
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search shops..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={includeInactive}
                        onChange={(e) => setIncludeInactive(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-sm">Include inactive shops</span>
                </label>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shops</CardTitle>
                    <CardDescription>
                        All business locations and their details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading shops...</p>
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Store className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No shops found</h3>
                            <p className="mb-4">Create your first shop to get started</p>
                            <Button onClick={handleNewShop}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Shop
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map((shop) => (
                                <div key={shop.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Store className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{shop.name}</h3>
                                                <p className="text-sm text-gray-600">{shop.business.name}</p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(shop.isActive)}>
                                            {shop.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">{shop.address}</span>
                                        </div>
                                        {shop.phone && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{shop.phone}</span>
                                            </div>
                                        )}
                                        {shop.email && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{shop.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="flex items-center justify-center mb-1">
                                                <Package className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="text-sm font-medium">{shop._count.inventory}</div>
                                            <div className="text-xs text-gray-600">Products</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="flex items-center justify-center mb-1">
                                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="text-sm font-medium">{shop._count.sales}</div>
                                            <div className="text-xs text-gray-600">Sales</div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <div className="flex items-center justify-center mb-1">
                                                <Users className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="text-sm font-medium">{shop.users.length}</div>
                                            <div className="text-xs text-gray-600">Users</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/shops/${shop.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditShop(shop)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteShop(shop)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Created {new Date(shop.createdAt).toLocaleDateString()}
                                        </div>
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
                    onPageChange={fetchShops}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <ShopDialog
                open={isShopDialogOpen}
                onOpenChange={setIsShopDialogOpen}
                shop={selectedShop}
                mode={dialogMode}
                businesses={businesses}
                onSave={handleShopSaved}
            />
        </div>
    )
}
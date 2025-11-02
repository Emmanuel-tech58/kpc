"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Users, Package, TrendingUp, ArrowUpRight, Activity, DollarSign, ShoppingCart, AlertTriangle, BarChart3, Calendar, Clock, MapPin, Phone, Mail } from "lucide-react"
import Link from 'next/link'

interface Shop {
    id: string;
    name: string;
    address: string;
    phone?: string | null;
    email?: string | null;
    isActive: boolean;
    business: {
        name: string;
    };
    sales?: Array<{
        id: string;
        saleNumber?: string;
        finalAmount?: number;
        createdAt?: string;
        status?: string;
    }>;
    inventory?: Array<{
        id: string;
        quantity?: number;
        lastUpdated?: string;
        product?: { id: string; name?: string; sku?: string; minStock?: number };
    }>;
    _count?: {
        inventory?: number;
        sales?: number;
        stockMovements?: number;
        users?: number;
    };
}

interface ShopMetrics {
    totalRevenue: number;
    totalSales: number;
    totalProducts: number;
    lowStockCount: number;
}

export default function ShopDetailsPage() {
    const params = useParams()
    const shopId = params.id as string

    const [shop, setShop] = useState<Shop | null>(null)
    const [metrics, setMetrics] = useState<ShopMetrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (shopId) {
            const load = async () => {
                setLoading(true)
                await fetchShopDetails()
                setLoading(false)
            }
            load()
        }
    }, [shopId])

    const fetchShopDetails = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}`)
            if (!response.ok) throw new Error('Failed to fetch shop details')
            const data = await response.json()
            // API may return the shop directly or wrapped as { shop }
            const shopData: Shop = data?.shop || data
            setShop(shopData)

            // compute metrics from shop data
            const totalRevenue = (shopData.sales || []).reduce((s, sale) => s + (sale.finalAmount || 0), 0)
            const totalSales = (shopData.sales || []).length || (shopData._count?.sales || 0)
            const totalProducts = shopData._count?.inventory || (shopData.inventory || []).length
            const lowStockCount = (shopData.inventory || []).filter(inv => {
                const qty = inv.quantity || 0
                const min = inv.product?.minStock || 0
                return min > 0 ? qty <= min : false
            }).length

            setMetrics({ totalRevenue, totalSales, totalProducts, lowStockCount })
        } catch (error) {
            console.error(error)
            toast.error('Failed to load shop details.')
        }
    }

    const formatCurrency = (amount: number) => `MWK ${amount.toLocaleString()}`

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="ml-3 text-gray-600">Loading shop dashboard...</p>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="text-center">
                <p className="text-lg text-gray-600">Shop not found.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/shops">Back to Shops</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Store className="h-8 w-8 text-primary" />
                        {shop.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{shop.address}</span>
                        </div>
                        {shop.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{shop.phone}</span>
                            </div>
                        )}
                        {shop.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span>{shop.email}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={shop.isActive ? "default" : "destructive"}>
                        {shop.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline">Edit Shop</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{metrics?.totalSales || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalProducts || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{metrics?.lowStockCount || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for more detailed sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {shop?.sales && shop.sales.length > 0 ? (
                            <div className="space-y-3">
                                {shop.sales.slice(0, 10).map((s) => (
                                    <div key={s.id} className="flex items-center justify-between border rounded p-3">
                                        <div>
                                            <div className="font-medium">{s.saleNumber || s.id}</div>
                                            <div className="text-sm text-gray-500">{s.status || '—'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{formatCurrency(s.finalAmount || 0)}</div>
                                            <div className="text-xs text-gray-500">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No recent sales</p>
                                <p className="text-sm">Sales for this shop will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {shop?.inventory && shop.inventory.length > 0 ? (
                            <div className="space-y-3">
                                {shop.inventory.slice(0, 10).map((inv) => (
                                    <div key={inv.id} className="flex items-center justify-between border rounded p-3">
                                        <div>
                                            <div className="font-medium">{inv.product?.name || inv.product?.id}</div>
                                            <div className="text-sm text-gray-500">SKU: {inv.product?.sku || '—'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold ${inv.quantity === 0 ? 'text-red-600' : ''}`}>{inv.quantity ?? 0}</div>
                                            <div className="text-xs text-gray-500">{inv.lastUpdated ? new Date(inv.lastUpdated).toLocaleString() : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No inventory data</p>
                                <p className="text-sm">Inventory for this shop will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

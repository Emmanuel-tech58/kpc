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
}

interface ShopMetrics {
    totalRevenue: number;
    totalSales: number;
    totalProducts: number;
    lowStockCount: number;
}

export default function ShopDetailsPage() {
    const params = useParams()
    const shopId = params.shopId as string

    const [shop, setShop] = useState<Shop | null>(null)
    const [metrics, setMetrics] = useState<ShopMetrics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (shopId) {
            fetchShopDetails()
            fetchShopMetrics()
        }
    }, [shopId])

    const fetchShopDetails = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}`)
            if (!response.ok) throw new Error('Failed to fetch shop details')
            const data = await response.json()
            setShop(data.shop)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load shop details.')
        }
    }

    const fetchShopMetrics = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}/metrics`)
            if (!response.ok) throw new Error('Failed to fetch shop metrics')
            const data = await response.json()
            setMetrics(data.metrics)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load shop metrics.')
        } finally {
            setLoading(false)
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
                        <p>Sales data will be displayed here.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Inventory details will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

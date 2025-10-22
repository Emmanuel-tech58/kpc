"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Users, Package, TrendingUp, ArrowUpRight, Activity, DollarSign, ShoppingCart, AlertTriangle, BarChart3, Calendar, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { toast } from 'sonner'

interface MetricsData {
    totalRevenue: number
    totalSales: number
    totalProducts: number
    activeShops: number
    grossProfit: number
    netProfit: number
    profitMargin: number
    costOfGoodsSold: number
    operatingExpenses: number
    averageOrderValue: number
    revenueGrowth: number
    salesGrowth: number
    profitGrowth: number
    lowStockCount: number
}

interface LowStockItem {
    id: string
    name: string
    sku?: string
    currentStock: number
    minStock: number
    shop: {
        name: string
    }
    category: {
        name: string
    }
    stockStatus: string
}

interface ProfitLossData {
    period: string
    revenue: number
    totalRevenue: number
    totalTax: number
    costOfGoodsSold: number
    grossProfit: number
    operatingExpenses: number
    netProfit: number
    profitMargin: number
    salesCount: number
    averageOrderValue: number
    totalDiscounts: number
    totalBeforeDiscounts: number
    discountPercentage: number
    vatEnabled: boolean
    vatRate: number
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true)
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
    const [profitLossData, setProfitLossData] = useState<ProfitLossData[]>([])

    useEffect(() => {
        if (status === 'loading') return
        if (status === 'unauthenticated') {
            redirect('/auth/signin')
            return
        }
        if (session?.user) {
            fetchDashboardData()
        }
    }, [session, status])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch data from APIs
            const [metricsResponse, lowStockResponse, profitLossResponse] = await Promise.all([
                fetch('/api/dashboard/metrics'),
                fetch('/api/inventory/low-stock'),
                fetch('/api/reports/profit-loss?period=month')
            ])

            if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json()
                setMetricsData(metricsData.metrics || null)
            }

            if (lowStockResponse.ok) {
                const lowStockData = await lowStockResponse.json()
                setLowStockItems(lowStockData.items || [])
            }

            if (profitLossResponse.ok) {
                const profitLossData = await profitLossResponse.json()
                setProfitLossData(profitLossData.reports || [])
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => `MWK ${amount.toLocaleString()}`

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="ml-3 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    const { user } = session

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Welcome back, {user.firstName}!
                                </h1>
                                <p className="text-gray-600">Here's your business overview and key metrics.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/sales">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                New Sale
                            </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/inventory">
                                <Package className="mr-2 h-5 w-5" />
                                Manage Inventory
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Enhanced Business Metrics Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl">
                                <DollarSign className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                {metricsData?.revenueGrowth ? `+${metricsData.revenueGrowth.toFixed(1)}%` : '+0%'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(metricsData?.totalRevenue || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {metricsData?.revenueGrowth ? `+${metricsData.revenueGrowth.toFixed(1)}% from last month` : 'from last month'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                {metricsData?.profitGrowth ? `+${metricsData.profitGrowth.toFixed(1)}%` : '+0%'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(metricsData?.grossProfit || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {metricsData?.profitMargin ? `${metricsData.profitMargin.toFixed(1)}% margin` : '0% margin'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                <BarChart3 className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                {metricsData?.profitGrowth ? `+${metricsData.profitGrowth.toFixed(1)}%` : '+0%'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Net Profit</p>
                            <p className="text-2xl font-semibold text-green-600">
                                {formatCurrency(metricsData?.netProfit || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {metricsData?.profitMargin ? `${metricsData.profitMargin.toFixed(1)}% net margin` : '0% net margin'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                                <ShoppingCart className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                {metricsData?.salesGrowth ? `+${metricsData.salesGrowth.toFixed(1)}%` : '+0%'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Sales Count</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {metricsData?.totalSales || 0}
                            </p>
                            <p className="text-xs text-gray-500">transactions this month</p>
                        </div>
                    </div>
                    <Link href="/dashboard/shops" className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 block">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl">
                                <Store className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                                <ArrowUpRight className="h-4 w-4" />
                                Manage
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Active Shops</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {metricsData?.activeShops || 0}
                            </p>
                            <p className="text-xs text-gray-500">Click to manage shops</p>
                        </div>
                    </Link>
                </div>

                {/* Stock Alerts Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                                <p className="text-gray-600">Critical inventory levels requiring attention</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl">
                            <Link href="/dashboard/inventory">
                                Manage Stock
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {lowStockItems.length > 0 ? (
                            lowStockItems.slice(0, 3).map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border ${item.stockStatus === 'OUT_OF_STOCK'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-yellow-50 border-yellow-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.stockStatus === 'OUT_OF_STOCK'
                                            ? 'bg-red-100'
                                            : 'bg-yellow-100'
                                            }`}>
                                            <Package className={`h-4 w-4 ${item.stockStatus === 'OUT_OF_STOCK'
                                                ? 'text-red-600'
                                                : 'text-yellow-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.sku && `SKU: ${item.sku} • `}{item.shop.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Stock:</span>
                                            <span className={`font-semibold ${item.stockStatus === 'OUT_OF_STOCK'
                                                ? 'text-red-600'
                                                : 'text-yellow-600'
                                                }`}>
                                                {item.currentStock} / {item.minStock}
                                            </span>
                                        </div>
                                        <Badge className={`text-xs ${item.stockStatus === 'OUT_OF_STOCK'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">All stock levels are healthy</p>
                                <p className="text-sm">No items require immediate attention</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total items needing attention:</span>
                            <span className="font-semibold text-gray-900">{lowStockItems.length} products</span>
                        </div>
                    </div>
                </div>

                {/* Profit & Loss Summary */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Profit & Loss Summary</h3>
                                <p className="text-gray-600">Current month financial overview</p>
                            </div>
                        </div>
                    </div>

                    {profitLossData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Revenue</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(profitLossData[0]?.revenue || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Less: Cost of Goods</span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(profitLossData[0]?.costOfGoodsSold || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Gross Profit</span>
                                    <span className="font-semibold text-blue-600">
                                        {formatCurrency(profitLossData[0]?.grossProfit || 0)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Less: Operating Expenses</span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(profitLossData[0]?.operatingExpenses || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Net Profit</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(profitLossData[0]?.netProfit || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Profit Margin</span>
                                    <span className="font-semibold text-purple-600">
                                        {profitLossData[0]?.profitMargin?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No financial data available</p>
                            <p className="text-sm">Start making sales to see your profit & loss summary</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
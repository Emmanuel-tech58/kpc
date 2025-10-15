"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Filter, Plus, Eye, DollarSign, Calendar, User, TrendingUp } from "lucide-react"
import { toast } from 'sonner'
import { SalesDialog } from '@/components/sales/sales-dialog'
import { Pagination } from '@/components/ui/pagination'

interface Sale {
    id: string
    saleNumber: string
    totalAmount: number
    discount: number
    tax: number
    finalAmount: number
    paymentMethod: string
    status: string
    notes?: string
    createdAt: string
    shop: {
        id: string
        name: string
    }
    user: {
        id: string
        firstName: string
        lastName: string
    }
    customer?: {
        id: string
        name: string
    }
    items: {
        id: string
        quantity: number
        unitPrice: number
        totalPrice: number
        product: {
            id: string
            name: string
            sku?: string
        }
    }[]
}

interface Shop {
    id: string
    name: string
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([])
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedShop, setSelectedShop] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false)
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create')

    const fetchSales = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedShop && { shopId: selectedShop }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            })

            const response = await fetch(`/api/sales?${params}`)
            if (!response.ok) throw new Error('Failed to fetch sales')

            const data = await response.json()
            setSales(data.sales || [])
            setTotalItems(data.pagination?.total || 0)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching sales:', error)
            toast.error('Failed to fetch sales')
            setSales([])
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

    useEffect(() => {
        fetchSales()
        fetchShops()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchSales(1)
        }, 500)
        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedShop, startDate, endDate, pageSize])

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const handleViewSale = (sale: Sale) => {
        setSelectedSale(sale)
        setDialogMode('view')
        setIsSalesDialogOpen(true)
    }

    const handleNewSale = () => {
        setSelectedSale(null)
        setDialogMode('create')
        setIsSalesDialogOpen(true)
    }

    const handleSaleSaved = () => {
        fetchSales(currentPage)
        setIsSalesDialogOpen(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            case 'REFUNDED': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'CASH': return 'bg-green-100 text-green-800'
            case 'CARD': return 'bg-blue-100 text-blue-800'
            case 'BANK_TRANSFER': return 'bg-purple-100 text-purple-800'
            case 'MOBILE_MONEY': return 'bg-orange-100 text-orange-800'
            case 'CREDIT': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
                    <p className="text-muted-foreground">
                        View and manage all sales transactions
                    </p>
                </div>
                <Button onClick={handleNewSale}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Sale
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search sales..."
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
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">From:</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-auto"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">To:</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-auto"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0]
                            setStartDate(today)
                            setEndDate(today)
                        }}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const today = new Date()
                            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                            setStartDate(weekAgo.toISOString().split('T')[0])
                            setEndDate(today.toISOString().split('T')[0])
                        }}
                    >
                        Last 7 Days
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const today = new Date()
                            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                            setStartDate(monthAgo.toISOString().split('T')[0])
                            setEndDate(today.toISOString().split('T')[0])
                        }}
                    >
                        Last 30 Days
                    </Button>
                </div>
                {(startDate || endDate) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setStartDate('')
                            setEndDate('')
                        }}
                    >
                        Clear Dates
                    </Button>
                )}
            </div>

            {/* Sales Summary */}
            {sales.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-600">Total Sales</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {sales.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                MWK {sales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-600">Average Sale</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                MWK {(sales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0) / sales.length).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Sales Transactions</CardTitle>
                    <CardDescription>
                        A list of all sales transactions with details
                        {(startDate || endDate) && (
                            <span className="ml-2">
                                • Filtered by date: {startDate && new Date(startDate).toLocaleDateString()}
                                {startDate && endDate && ' - '}
                                {endDate && new Date(endDate).toLocaleDateString()}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading sales...</p>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No sales found</h3>
                            <p className="mb-4">Start making sales to see them here</p>
                            <Button onClick={handleNewSale}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Sale
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sales.map((sale) => (
                                <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{sale.saleNumber}</h3>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <User className="h-4 w-4" />
                                                    <span>{sale.user.firstName} {sale.user.lastName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="font-semibold text-lg">MWK {sale.finalAmount}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <Badge className={getStatusColor(sale.status)}>
                                                    {sale.status}
                                                </Badge>
                                                <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                                                    {sale.paymentMethod.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewSale(sale)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                                        <span>Shop: {sale.shop.name}</span>
                                        {sale.customer && <span>Customer: {sale.customer.name}</span>}
                                        {sale.discount > 0 && <span>Discount: MWK {sale.discount}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card >

            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={fetchSales}
                    onPageSizeChange={handlePageSizeChange}
                />
            )
            }

            <SalesDialog
                open={isSalesDialogOpen}
                onOpenChange={setIsSalesDialogOpen}
                sale={selectedSale}
                mode={dialogMode}
                shops={shops}
                onSave={handleSaleSaved}
            />
        </div >
    )
}
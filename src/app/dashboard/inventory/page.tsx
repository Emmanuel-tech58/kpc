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
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react'
import { ProductDataTable } from '@/components/products/product-data-table'
import { ProductDialog } from '@/components/products/product-dialog'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { toast } from 'sonner'

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

interface Category {
    id: string
    name: string
    description?: string
}

interface Supplier {
    id: string
    name: string
    contactName?: string
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedSupplier, setSelectedSupplier] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [stockFilter, setStockFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Dialog states
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')

    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory && { categoryId: selectedCategory }),
                ...(selectedSupplier && { supplierId: selectedSupplier }),
                ...(statusFilter && { isActive: statusFilter }),
                ...(stockFilter === 'low' && { lowStock: 'true' })
            })

            const response = await fetch(`/api/products?${params}`)
            if (!response.ok) throw new Error('Failed to fetch products')

            const data = await response.json()
            setProducts(data.products || [])
            setTotalPages(data.pagination.pages)
            setTotalProducts(data.pagination.total)
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to fetch products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (!response.ok) throw new Error('Failed to fetch categories')
            const data = await response.json()
            setCategories(Array.isArray(data) ? data : data.categories || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        }
    }

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('/api/suppliers')
            if (!response.ok) throw new Error('Failed to fetch suppliers')
            const data = await response.json()
            setSuppliers(Array.isArray(data) ? data : data.suppliers || [])
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            setSuppliers([])
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
        fetchSuppliers()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchProducts(1)
        }, 500)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedCategory, selectedSupplier, statusFilter, stockFilter, pageSize])

    const handleCreateProduct = () => {
        setSelectedProduct(null)
        setDialogMode('create')
        setIsProductDialogOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setDialogMode('edit')
        setIsProductDialogOpen(true)
    }

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product)
        setDialogMode('view')
        setIsProductDialogOpen(true)
    }

    const handleDeleteProduct = (product: Product) => {
        setSelectedProduct(product)
        setIsDeleteDialogOpen(true)
    }

    const handleProductSaved = () => {
        fetchProducts(currentPage)
        setIsProductDialogOpen(false)
    }

    const handleProductDeleted = () => {
        fetchProducts(currentPage)
        setIsDeleteDialogOpen(false)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedSupplier('')
        setStatusFilter('')
        setStockFilter('')
    }

    // Calculate stats
    const activeProducts = products.filter(p => p.isActive).length
    const lowStockProducts = products.filter(p => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        return totalStock <= p.minStock
    }).length
    const outOfStockProducts = products.filter(p => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        return totalStock === 0
    }).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Product Inventory
                                </h1>
                                <p className="text-gray-600">Manage your products and stock levels</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateProduct}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                    </Button>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
                                <p className="text-xs text-gray-500">All products</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                                <p className="text-2xl font-semibold text-yellow-600">{lowStockProducts}</p>
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
                                <p className="text-2xl font-semibold text-red-600">{outOfStockProducts}</p>
                                <p className="text-xs text-gray-500">Urgent attention</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alerts Detail Section */}
                {(lowStockProducts > 0 || outOfStockProducts > 0) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                                    <p className="text-gray-600">Products requiring immediate attention</p>
                                </div>
                            </div>
                            <Badge className="bg-red-100 text-red-800">
                                {lowStockProducts + outOfStockProducts} items
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products
                                .filter(p => {
                                    const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
                                    return totalStock <= p.minStock
                                })
                                .slice(0, 6)
                                .map((product) => {
                                    const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
                                    const isOutOfStock = totalStock === 0;
                                    const stockPercentage = product.minStock > 0 ? (totalStock / product.minStock) * 100 : 0;

                                    return (
                                        <div key={product.id} className={`p-4 rounded-xl border ${isOutOfStock
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-yellow-50 border-yellow-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2 rounded-lg ${isOutOfStock ? 'bg-red-100' : 'bg-yellow-100'
                                                    }`}>
                                                    <Package className={`h-4 w-4 ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'
                                                        }`} />
                                                </div>
                                                <Badge className={`text-xs ${isOutOfStock
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                                {product.sku && (
                                                    <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                                )}
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-600">Stock:</span>
                                                    <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>
                                                        {totalStock} / {product.minStock}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Stock Level Bar */}
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Stock Level:</span>
                                                    <span className="text-xs font-semibold text-gray-700">{stockPercentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-200 mt-1">
                                                    <div
                                                        className={`h-2 rounded-full ${isOutOfStock
                                                            ? 'bg-red-500'
                                                            : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${stockPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>

                        {products.filter(p => {
                            const totalStock = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
                            return totalStock <= p.minStock
                        }).length > 6 && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStockFilter('low')}
                                        className="w-full max-w-xs mx-auto"
                                    >
                                        View All {lowStockProducts} Low Stock Products
                                    </Button>
                                </div>
                            )}
                    </div>
                )
                }

                {/* Profit Analysis Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search products by name, SKU, barcode, or brand..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-48"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-48"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-32"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>

                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="h-12 px-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 min-w-32"
                            >
                                <option value="">All Stock</option>
                                <option value="low">Low Stock</option>
                            </select>

                            {(searchTerm || selectedCategory || selectedSupplier || statusFilter || stockFilter) && (
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
                    <ProductDataTable
                        products={products}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalProducts={totalProducts}
                        pageSize={pageSize}
                        onPageChange={fetchProducts}
                        onPageSizeChange={handlePageSizeChange}
                        onEdit={handleEditProduct}
                        onView={handleViewProduct}
                        onDelete={handleDeleteProduct}
                    />
                </div>

                {/* Dialogs */}
                <ProductDialog
                    open={isProductDialogOpen}
                    onOpenChange={setIsProductDialogOpen}
                    product={selectedProduct}
                    mode={dialogMode}
                    categories={categories}
                    suppliers={suppliers}
                    onSave={handleProductSaved}
                />

                <DeleteProductDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    product={selectedProduct}
                    onDelete={handleProductDeleted}
                />
            </div>
        </div>
    )
}
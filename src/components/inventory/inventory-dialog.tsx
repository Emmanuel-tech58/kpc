"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Package,
    X,
    Store,
    DollarSign,
    TrendingUp
} from 'lucide-react'
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

interface Product {
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

interface InventoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inventory: InventoryItem | null
    mode: 'create' | 'edit' | 'view'
    shops: Shop[]
    onSave: () => void
}

interface FormData {
    productId: string
    shopId: string
    quantity: number
    costPrice: number
    sellingPrice: number
}

export function InventoryDialog({
    open,
    onOpenChange,
    inventory,
    mode,
    shops,
    onSave
}: InventoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [productSearch, setProductSearch] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [showProductDropdown, setShowProductDropdown] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        productId: '',
        shopId: '',
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProductDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch products for selection
    const fetchProducts = async (search = '') => {
        try {
            const params = new URLSearchParams({
                limit: '50',
                ...(search && { search })
            })
            const response = await fetch(`/api/products?${params}`)
            if (!response.ok) throw new Error('Failed to fetch products')

            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        }
    }

    useEffect(() => {
        if (open && mode === 'create') {
            fetchProducts()
        }
    }, [open, mode])

    useEffect(() => {
        if (inventory && (mode === 'edit' || mode === 'view')) {
            setFormData({
                productId: inventory.product.id,
                shopId: inventory.shop.id,
                quantity: inventory.quantity,
                costPrice: Number(inventory.costPrice),
                sellingPrice: Number(inventory.sellingPrice)
            })
            setSelectedProduct({
                id: inventory.product.id,
                name: inventory.product.name,
                sku: inventory.product.sku,
                unit: inventory.product.unit,
                minStock: inventory.product.minStock,
                maxStock: inventory.product.maxStock,
                category: inventory.product.category,
                supplier: inventory.product.supplier
            })
            setProductSearch(inventory.product.name)
        } else if (mode === 'create') {
            setFormData({
                productId: '',
                shopId: '',
                quantity: 0,
                costPrice: 0,
                sellingPrice: 0
            })
            setSelectedProduct(null)
            setProductSearch('')
        }
        setErrors({})
    }, [inventory, mode])

    // Handle product search
    useEffect(() => {
        if (mode === 'create' && productSearch.length > 0) {
            const debounceTimer = setTimeout(() => {
                fetchProducts(productSearch)
            }, 300)
            return () => clearTimeout(debounceTimer)
        }
    }, [productSearch, mode])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (mode === 'create') {
            if (!formData.productId) newErrors.productId = 'Product is required'
            if (!formData.shopId) newErrors.shopId = 'Shop is required'
        }
        if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative'
        if (formData.costPrice < 0) newErrors.costPrice = 'Cost price cannot be negative'
        if (formData.sellingPrice < 0) newErrors.sellingPrice = 'Selling price cannot be negative'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const url = mode === 'create' ? '/api/inventory' : `/api/inventory/${inventory?.id}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const submitData = mode === 'create' ? formData : {
                quantity: formData.quantity,
                costPrice: formData.costPrice,
                sellingPrice: formData.sellingPrice
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save inventory')
            }

            toast.success(mode === 'create' ? 'Inventory item created successfully' : 'Inventory updated successfully')
            onSave()
        } catch (error) {
            console.error('Error saving inventory:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save inventory')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product)
        setProductSearch(product.name)
        setFormData(prev => ({ ...prev, productId: product.id }))
        setShowProductDropdown(false)
        if (errors.productId) {
            setErrors(prev => ({ ...prev, productId: '' }))
        }
    }

    const handleProductSearchChange = (value: string) => {
        setProductSearch(value)
        setShowProductDropdown(true)
        if (!value) {
            setSelectedProduct(null)
            setFormData(prev => ({ ...prev, productId: '' }))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowProductDropdown(false)
        }
    }

    const calculateMargin = () => {
        if (formData.costPrice === 0) return 0
        return ((formData.sellingPrice - formData.costPrice) / formData.costPrice * 100)
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add Inventory Item'
            case 'edit': return 'Edit Inventory'
            case 'view': return 'Inventory Details'
            default: return 'Inventory'
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Add a product to a shop\'s inventory with pricing.'}
                            {mode === 'edit' && 'Update inventory quantities and pricing.'}
                            {mode === 'view' && 'View inventory details and stock information.'}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    {mode === 'view' && inventory ? (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                                    <Package className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{inventory.product.name}</h3>
                                    {inventory.product.sku && (
                                        <p className="text-gray-600 font-mono">SKU: {inventory.product.sku}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline">{inventory.product.category.name}</Badge>
                                        <Badge variant="outline">{inventory.shop.name}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <label className="text-sm font-medium text-blue-600">Available Stock</label>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {inventory.quantity - inventory.reservedQty} {inventory.product.unit}
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <label className="text-sm font-medium text-yellow-600">Reserved</label>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {inventory.reservedQty} {inventory.product.unit}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <label className="text-sm font-medium text-green-600">Total Stock</label>
                                    <p className="text-2xl font-bold text-green-900">
                                        {inventory.quantity} {inventory.product.unit}
                                    </p>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-600">Cost Price</label>
                                    <p className="text-xl font-bold text-gray-900">${inventory.costPrice}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-600">Selling Price</label>
                                    <p className="text-xl font-bold text-gray-900">${inventory.sellingPrice}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="text-sm font-medium text-gray-600">Margin</label>
                                    <p className="text-xl font-bold text-gray-900">
                                        {((Number(inventory.sellingPrice) - Number(inventory.costPrice)) / Number(inventory.costPrice) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === 'create' && (
                                <>
                                    {/* Product and Shop Selection */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Product & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Shop *
                                                </label>
                                                <select
                                                    value={formData.shopId}
                                                    onChange={(e) => handleInputChange('shopId', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md ${errors.shopId ? 'border-red-500' : 'border-gray-300'}`}
                                                >
                                                    <option value="">Select a shop</option>
                                                    {shops.map((shop) => (
                                                        <option key={shop.id} value={shop.id}>
                                                            {shop.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.shopId && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.shopId}</p>
                                                )}
                                            </div>
                                            <div className="relative" ref={dropdownRef}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Product *
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        value={productSearch}
                                                        onChange={(e) => handleProductSearchChange(e.target.value)}
                                                        onFocus={() => setShowProductDropdown(true)}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder="Search for a product..."
                                                        className={errors.productId ? 'border-red-500' : ''}
                                                    />
                                                    <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                </div>

                                                {/* Product Dropdown */}
                                                {showProductDropdown && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                        {products.length > 0 ? (
                                                            products.map((product) => (
                                                                <button
                                                                    key={product.id}
                                                                    type="button"
                                                                    onClick={() => handleProductSelect(product)}
                                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{product.name}</div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {product.sku && `SKU: ${product.sku} • `}
                                                                                {product.category.name} • {product.unit}
                                                                            </div>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {product.supplier.name}
                                                                        </Badge>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-center text-gray-500">
                                                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                                <p className="text-sm">No products found</p>
                                                                <p className="text-xs">Try a different search term</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Selected Product Display */}
                                                {selectedProduct && (
                                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium text-blue-900">{selectedProduct.name}</div>
                                                                <div className="text-sm text-blue-700">
                                                                    {selectedProduct.sku && `SKU: ${selectedProduct.sku} • `}
                                                                    Min Stock: {selectedProduct.minStock} {selectedProduct.unit}
                                                                </div>
                                                            </div>
                                                            <Badge className="bg-blue-100 text-blue-800">
                                                                {selectedProduct.category.name}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}

                                                {errors.productId && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Stock Quantity */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Stock Information</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity {selectedProduct && `(${selectedProduct.unit})`} *
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.quantity === 0 ? '' : formData.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                                            handleInputChange('quantity', isNaN(value) ? 0 : value)
                                        }}
                                        placeholder="0"
                                        className={errors.quantity ? 'border-red-500' : ''}
                                    />
                                    {errors.quantity && (
                                        <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Pricing */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Pricing</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cost Price *
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.costPrice === 0 ? '' : formData.costPrice}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                handleInputChange('costPrice', isNaN(value) ? 0 : value)
                                            }}
                                            placeholder="0.00"
                                            className={errors.costPrice ? 'border-red-500' : ''}
                                        />
                                        {errors.costPrice && (
                                            <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Selling Price *
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.sellingPrice === 0 ? '' : formData.sellingPrice}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                                                handleInputChange('sellingPrice', isNaN(value) ? 0 : value)
                                            }}
                                            placeholder="0.00"
                                            className={errors.sellingPrice ? 'border-red-500' : ''}
                                        />
                                        {errors.sellingPrice && (
                                            <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Margin Display */}
                                {(formData.costPrice > 0 || formData.sellingPrice > 0) && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600">Profit Margin:</span>
                                            <Badge className={calculateMargin() > 0
                                                ? "bg-green-100 text-green-800"
                                                : calculateMargin() < 0
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }>
                                                {calculateMargin() > 0 ? '+' : ''}{calculateMargin().toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                                >
                                    {loading ? 'Saving...' : mode === 'create' ? 'Add to Inventory' : 'Update Inventory'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                {mode === 'view' && (
                    <div className="flex justify-end space-x-2 p-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
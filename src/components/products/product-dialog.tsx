"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
    Package,
    X,
    Tag,
    Barcode,
    Building2,
    Calendar,
    TrendingUp,
    ShoppingCart,
    AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

interface ProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: Product | null
    mode: 'create' | 'edit' | 'view'
    categories: Category[]
    suppliers: Supplier[]
    onSave: () => void
}

interface FormData {
    name: string
    description: string
    sku: string
    barcode: string
    brand: string
    unit: string
    minStock: number
    maxStock: number | undefined
    categoryId: string
    supplierId: string
    isActive: boolean
    // Inventory data for the default shop
    costPrice: number
    sellingPrice: number
    initialStock: number
}

const UNIT_OPTIONS = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'liter', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'meter', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
    { value: 'box', label: 'Boxes' },
    { value: 'pack', label: 'Packs' },
    { value: 'bottle', label: 'Bottles' }
]

export function ProductDialog({
    open,
    onOpenChange,
    product,
    mode,
    categories,
    suppliers,
    onSave
}: ProductDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        brand: '',
        unit: 'pcs',
        minStock: 0,
        maxStock: undefined,
        categoryId: '',
        supplierId: '',
        isActive: true,
        costPrice: 0,
        sellingPrice: 0,
        initialStock: 0
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (product && (mode === 'edit' || mode === 'view')) {
            // Get the first inventory record for pricing (or default values)
            const firstInventory = product.inventory?.[0]
            setFormData({
                name: product.name,
                description: product.description || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                brand: product.brand || '',
                unit: product.unit,
                minStock: product.minStock,
                maxStock: product.maxStock || undefined,
                categoryId: product.category.id,
                supplierId: product.supplier.id,
                isActive: product.isActive,
                costPrice: firstInventory ? Number(firstInventory.costPrice) : 0,
                sellingPrice: firstInventory ? Number(firstInventory.sellingPrice) : 0,
                initialStock: firstInventory ? firstInventory.quantity : 0
            })
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                sku: '',
                barcode: '',
                brand: '',
                unit: 'pcs',
                minStock: 0,
                maxStock: undefined,
                categoryId: '',
                supplierId: '',
                isActive: true,
                costPrice: 0,
                sellingPrice: 0,
                initialStock: 0
            })
        }
        setErrors({})
    }, [product, mode])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Product name is required'
        if (!formData.categoryId) newErrors.categoryId = 'Category is required'
        if (!formData.supplierId) newErrors.supplierId = 'Supplier is required'
        if (formData.minStock < 0) newErrors.minStock = 'Minimum stock cannot be negative'
        if (formData.maxStock !== undefined && formData.maxStock < formData.minStock) {
            newErrors.maxStock = 'Maximum stock must be greater than minimum stock'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const url = mode === 'create' ? '/api/products' : `/api/products/${product?.id}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const submitData = {
                ...formData,
                sku: formData.sku.trim() || null,
                barcode: formData.barcode.trim() || null,
                brand: formData.brand.trim() || null,
                description: formData.description.trim() || null,
                maxStock: formData.maxStock || null
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
                throw new Error(error.error || 'Failed to save product')
            }

            toast.success(mode === 'create' ? 'Product created successfully' : 'Product updated successfully')
            onSave()
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save product')
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

    const getTotalStock = (inventory: Product['inventory']) => {
        return inventory.reduce((total, inv) => total + inv.quantity, 0)
    }

    const getStockStatus = (product: Product) => {
        const totalStock = getTotalStock(product.inventory)

        if (totalStock === 0) {
            return { status: 'out-of-stock', label: 'Out of Stock', color: 'text-red-600' }
        } else if (totalStock <= product.minStock) {
            return { status: 'low-stock', label: 'Low Stock', color: 'text-yellow-600' }
        } else {
            return { status: 'in-stock', label: 'In Stock', color: 'text-green-600' }
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Product'
            case 'edit': return 'Edit Product'
            case 'view': return 'Product Details'
            default: return 'Product'
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Add a new product to your inventory with details and stock information.'}
                            {mode === 'edit' && 'Update product information and settings.'}
                            {mode === 'view' && 'View product details and inventory information.'}
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
                    {mode === 'view' && product ? (
                        <div className="space-y-6">
                            {/* Product Basic Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-gray-600 mt-1">{product.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge className={getStockStatus(product).color}>
                                            {getStockStatus(product).label}
                                        </Badge>
                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        Product Information
                                    </h4>
                                    <div className="space-y-3 pl-6">
                                        {product.sku ? (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">SKU</label>
                                                <p className="text-gray-900 font-mono">{product.sku}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">SKU</label>
                                                <p className="text-gray-500 italic">No SKU assigned</p>
                                            </div>
                                        )}
                                        {product.barcode && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Barcode</label>
                                                <p className="text-gray-900 font-mono">{product.barcode}</p>
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Brand</label>
                                                <p className="text-gray-900">{product.brand}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Unit</label>
                                            <p className="text-gray-900">{product.unit}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Category & Supplier
                                    </h4>
                                    <div className="space-y-3 pl-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Category</label>
                                            <p className="text-gray-900">{product.category.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Supplier</label>
                                            <p className="text-gray-900">{product.supplier.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Stock Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Stock Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <label className="text-sm font-medium text-blue-600">Total Stock</label>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {getTotalStock(product.inventory)} {product.unit}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                        <label className="text-sm font-medium text-yellow-600">Minimum Stock</label>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            {product.minStock} {product.unit}
                                        </p>
                                    </div>
                                    {product.maxStock && (
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <label className="text-sm font-medium text-green-600">Maximum Stock</label>
                                            <p className="text-2xl font-bold text-green-900">
                                                {product.maxStock} {product.unit}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Inventory by Shop */}
                            {product.inventory.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Inventory by Shop</h4>
                                        <div className="space-y-2">
                                            {product.inventory.map((inv) => (
                                                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{inv.shop.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Available: {inv.quantity - inv.reservedQty} | Reserved: {inv.reservedQty}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">{inv.quantity} {product.unit}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Cost: ${inv.costPrice} | Sell: ${inv.sellingPrice}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {/* Activity Stats */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Activity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Total Sales</label>
                                        <p className="text-base font-medium text-gray-900">{product._count.saleItems}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created</label>
                                        <p className="text-gray-900">{format(new Date(product.createdAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-gray-900">{format(new Date(product.updatedAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name *
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter product name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand (Optional)
                                        </label>
                                        <Input
                                            value={formData.brand}
                                            onChange={(e) => handleInputChange('brand', e.target.value)}
                                            placeholder="Enter brand name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter product description"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Product Codes */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Product Codes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SKU (Optional)
                                        </label>
                                        <Input
                                            value={formData.sku}
                                            onChange={(e) => handleInputChange('sku', e.target.value)}
                                            placeholder="Enter SKU (optional)"
                                            className={errors.sku ? 'border-red-500' : ''}
                                        />
                                        {errors.sku && (
                                            <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Barcode (Optional)
                                        </label>
                                        <Input
                                            value={formData.barcode}
                                            onChange={(e) => handleInputChange('barcode', e.target.value)}
                                            placeholder="Enter barcode"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Category & Supplier */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Category & Supplier</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && (
                                            <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Supplier *
                                        </label>
                                        <select
                                            value={formData.supplierId}
                                            onChange={(e) => handleInputChange('supplierId', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.supplierId ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select a supplier</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.supplierId && (
                                            <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Stock Settings */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Stock Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit
                                        </label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => handleInputChange('unit', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            {UNIT_OPTIONS.map((unit) => (
                                                <option key={unit.value} value={unit.value}>
                                                    {unit.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Stock *
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.minStock === 0 ? '' : formData.minStock}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                                                handleInputChange('minStock', isNaN(value) ? 0 : value)
                                            }}
                                            placeholder="0"
                                            className={errors.minStock ? 'border-red-500' : ''}
                                        />
                                        {errors.minStock && (
                                            <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Maximum Stock (Optional)
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.maxStock === undefined ? '' : formData.maxStock}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? undefined : parseInt(e.target.value)
                                                handleInputChange('maxStock', isNaN(value!) ? undefined : value)
                                            }}
                                            placeholder="No limit"
                                            className={errors.maxStock ? 'border-red-500' : ''}
                                        />
                                        {errors.maxStock && (
                                            <p className="text-red-500 text-sm mt-1">{errors.maxStock}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Active Status</label>
                                        <div className="text-sm text-gray-500">
                                            Enable or disable this product in the system
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                    />
                                </div>
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
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                                >
                                    {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
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
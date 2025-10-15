"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    ShoppingCart,
    X,
    Plus,
    Minus,
    DollarSign,
    Package,
    User,
    Store
} from 'lucide-react'
import { toast } from 'sonner'

interface SaleItem {
    id?: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    product: {
        id: string
        name: string
        sku?: string
    }
}

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
    items: SaleItem[]
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
    inventory?: {
        id: string
        sellingPrice: number
        quantity: number
        shopId: string
    }[]
}

interface Customer {
    id: string
    name: string
    email?: string
    phone?: string
}

interface SalesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sale: Sale | null
    mode: 'create' | 'view'
    shops: Shop[]
    onSave: () => void
}

interface FormData {
    shopId: string
    customerId: string
    items: {
        productId: string
        quantity: number
        unitPrice: number
        discount: number
    }[]
    paymentMethod: string
    notes: string
}

export function SalesDialog({
    open,
    onOpenChange,
    sale,
    mode,
    shops,
    onSave
}: SalesDialogProps) {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [formData, setFormData] = useState<FormData>({
        shopId: '',
        customerId: '',
        items: [],
        paymentMethod: 'CASH',
        notes: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Fetch products and customers
    useEffect(() => {
        if (open && mode === 'create') {
            fetchProducts()
            fetchCustomers()
        }
    }, [open, mode])

    useEffect(() => {
        if (sale && mode === 'view') {
            setFormData({
                shopId: sale.shop.id,
                customerId: sale.customer?.id || '',
                items: sale.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    discount: Number(item.discount)
                })),
                paymentMethod: sale.paymentMethod,
                notes: sale.notes || ''
            })
        } else if (mode === 'create') {
            setFormData({
                shopId: '',
                customerId: '',
                items: [],
                paymentMethod: 'CASH',
                notes: ''
            })
        }
        setErrors({})
    }, [sale, mode])

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

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers?limit=100')
            if (!response.ok) throw new Error('Failed to fetch customers')
            const data = await response.json()
            setCustomers(data.customers || [])
        } catch (error) {
            console.error('Error fetching customers:', error)
        }
    }

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                productId: '',
                quantity: 1,
                unitPrice: 0,
                discount: 0
            }]
        }))
    }

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const updateItem = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value }

                    // Auto-fill unit price when product is selected
                    if (field === 'productId' && value && formData.shopId) {
                        const product = products.find(p => p.id === value)
                        if (product && product.inventory) {
                            const shopInventory = product.inventory.find(inv => inv.shopId === formData.shopId)
                            if (shopInventory) {
                                updatedItem.unitPrice = Number(shopInventory.sellingPrice)
                            }
                        }
                    }

                    return updatedItem
                }
                return item
            })
        }))
    }

    const calculateItemTotal = (item: any) => {
        return (item.unitPrice * item.quantity) - item.discount
    }

    const calculateSubTotal = () => {
        return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    }

    const calculateTotal = () => {
        return calculateSubTotal()
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.shopId) newErrors.shopId = 'Shop is required'
        if (formData.items.length === 0) newErrors.items = 'At least one item is required'

        formData.items.forEach((item, index) => {
            if (!item.productId) newErrors[`item_${index}_product`] = 'Product is required'
            if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
            if (item.unitPrice < 0) newErrors[`item_${index}_price`] = 'Price cannot be negative'
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create sale')
            }

            toast.success('Sale created successfully')
            onSave()
        } catch (error) {
            console.error('Error creating sale:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create sale')
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'New Sale'
            case 'view': return 'Sale Details'
            default: return 'Sale'
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
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Create a new sale transaction'}
                            {mode === 'view' && 'View sale transaction details'}
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
                    {mode === 'view' && sale ? (
                        <div className="space-y-6">
                            {/* Sale Header */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{sale.saleNumber}</h3>
                                    <p className="text-gray-600">{new Date(sale.createdAt).toLocaleString()}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={
                                            sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    sale.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                        }>
                                            {sale.status}
                                        </Badge>
                                        <Badge variant="outline">{sale.paymentMethod.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Sale Items */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                                <div className="space-y-2">
                                    {sale.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Package className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    {item.product.sku && (
                                                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">MWK {item.totalPrice}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity} × MWK {item.unitPrice}
                                                    {item.discount > 0 && ` - MWK ${item.discount}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sale Summary */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>MWK {sale.finalAmount}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} • {sale.paymentMethod.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shop and Customer Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shop *
                                    </label>
                                    <select
                                        value={formData.shopId}
                                        onChange={(e) => {
                                            const newShopId = e.target.value
                                            setFormData(prev => {
                                                const newData = { ...prev, shopId: newShopId }

                                                // Update all item prices when shop changes
                                                if (newShopId) {
                                                    newData.items = prev.items.map(item => {
                                                        if (item.productId) {
                                                            const product = products.find(p => p.id === item.productId)
                                                            if (product && product.inventory) {
                                                                const shopInventory = product.inventory.find(inv => inv.shopId === newShopId)
                                                                if (shopInventory) {
                                                                    return { ...item, unitPrice: Number(shopInventory.sellingPrice) }
                                                                }
                                                            }
                                                        }
                                                        return item
                                                    })
                                                }

                                                return newData
                                            })
                                        }}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer (Optional)
                                    </label>
                                    <select
                                        value={formData.customerId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Select a customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Separator />

                            {/* Items */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">Items</h4>
                                    <Button type="button" onClick={addItem} size="sm">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>

                                {formData.items.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No items added yet</p>
                                        <Button type="button" onClick={addItem} size="sm" className="mt-2">
                                            Add First Item
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Product *
                                                        </label>
                                                        <select
                                                            value={item.productId}
                                                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md ${errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'}`}
                                                        >
                                                            <option value="">Select product</option>
                                                            {products.map((product) => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name} {product.sku && `(${product.sku})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Quantity *
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Unit Price *
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className={errors[`item_${index}_price`] ? 'border-red-500' : ''}
                                                            readOnly
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Discount
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discount}
                                                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-right">
                                                    <span className="text-sm text-gray-600">
                                                        Item Total: <span className="font-medium">MWK {calculateItemTotal(item).toFixed(2)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {errors.items && (
                                    <p className="text-red-500 text-sm mt-1">{errors.items}</p>
                                )}
                            </div>

                            <Separator />

                            {/* Payment and Totals */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Method *
                                        </label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                            <option value="MOBILE_MONEY">Mobile Money</option>
                                            <option value="CREDIT">Credit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows={3}
                                            placeholder="Additional notes..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total:</span>
                                                <span>MWK {calculateTotal().toFixed(2)}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
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
                                    {loading ? 'Creating...' : 'Create Sale'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    X,
    Package,
    ShoppingCart,
    Trash2,
    Building2
} from 'lucide-react'
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

interface DeleteProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: Product | null
    onDelete: () => void
}

export function DeleteProductDialog({
    open,
    onOpenChange,
    product,
    onDelete
}: DeleteProductDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!product) return

        try {
            setLoading(true)

            const response = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete product')
            }

            toast.success('Product deleted successfully')
            onDelete()
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete product')
        } finally {
            setLoading(false)
        }
    }

    if (!open || !product) return null

    const hasRecords = product._count.saleItems > 0 ||
        product._count.purchaseItems > 0 ||
        product.inventory.length > 0

    const getTotalStock = () => {
        return product.inventory.reduce((total, inv) => total + inv.quantity, 0)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Product
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Product Info */}
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                                SKU: {product.sku || 'No SKU assigned'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {product.category.name}
                                </Badge>
                                {product.brand && (
                                    <Badge variant="outline" className="text-xs">
                                        {product.brand}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {hasRecords ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">Cannot Delete Product</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        This product has existing records and cannot be deleted:
                                    </p>
                                    <ul className="text-sm text-red-700 mt-2 space-y-1">
                                        {product._count.saleItems > 0 && (
                                            <li className="flex items-center gap-2">
                                                <ShoppingCart className="h-3 w-3" />
                                                {product._count.saleItems} sale record{product._count.saleItems === 1 ? '' : 's'}
                                            </li>
                                        )}
                                        {product._count.purchaseItems > 0 && (
                                            <li className="flex items-center gap-2">
                                                <Package className="h-3 w-3" />
                                                {product._count.purchaseItems} purchase record{product._count.purchaseItems === 1 ? '' : 's'}
                                            </li>
                                        )}
                                        {product.inventory.length > 0 && (
                                            <li className="flex items-center gap-2">
                                                <Building2 className="h-3 w-3" />
                                                {getTotalStock()} {product.unit} in inventory across {product.inventory.length} shop{product.inventory.length === 1 ? '' : 's'}
                                            </li>
                                        )}
                                    </ul>
                                    <p className="text-sm text-red-700 mt-2 font-medium">
                                        Consider deactivating this product instead.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-800">Confirm Deletion</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Are you sure you want to delete this product? This action cannot be undone.
                                    </p>
                                    <p className="text-sm text-amber-700 mt-2">
                                        The product "{product.name}" will be permanently removed from the system.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 p-6 border-t border-gray-200/50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    {!hasRecords && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? (
                                'Deleting...'
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Product
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
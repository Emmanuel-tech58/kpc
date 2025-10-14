"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    TrendingUp,
    X,
    Package,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    ArrowLeftRight,
    CornerDownLeft,
    AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface InventoryItem {
    id: string
    quantity: number
    reservedQty: number
    costPrice: number
    sellingPrice: number
    product: {
        id: string
        name: string
        sku?: string
        unit: string
        minStock: number
        maxStock?: number
    }
    shop: {
        id: string
        name: string
    }
}

interface StockMovementDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inventory: InventoryItem | null
    onSave: () => void
}

interface FormData {
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE'
    quantity: number
    reason: string
    reference: string
}

const MOVEMENT_TYPES = [
    {
        value: 'IN' as const,
        label: 'Stock In',
        description: 'Add stock (purchase, return from customer)',
        icon: ArrowUp,
        color: 'text-green-600'
    },
    {
        value: 'OUT' as const,
        label: 'Stock Out',
        description: 'Remove stock (sale, damage)',
        icon: ArrowDown,
        color: 'text-red-600'
    },
    {
        value: 'ADJUSTMENT' as const,
        label: 'Adjustment',
        description: 'Correct stock count (inventory audit)',
        icon: RotateCcw,
        color: 'text-blue-600'
    },
    {
        value: 'TRANSFER' as const,
        label: 'Transfer Out',
        description: 'Transfer to another shop',
        icon: ArrowLeftRight,
        color: 'text-purple-600'
    },
    {
        value: 'RETURN' as const,
        label: 'Return',
        description: 'Customer return',
        icon: CornerDownLeft,
        color: 'text-orange-600'
    },
    {
        value: 'DAMAGE' as const,
        label: 'Damage/Loss',
        description: 'Damaged or lost items',
        icon: AlertTriangle,
        color: 'text-red-600'
    }
]

export function StockMovementDialog({
    open,
    onOpenChange,
    inventory,
    onSave
}: StockMovementDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        type: 'IN',
        quantity: 0,
        reason: '',
        reference: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
        if (!formData.reason.trim()) newErrors.reason = 'Reason is required'

        // Check if there's enough stock for OUT operations
        if (inventory && (formData.type === 'OUT' || formData.type === 'DAMAGE' || formData.type === 'TRANSFER')) {
            const availableStock = inventory.quantity - inventory.reservedQty
            if (formData.quantity > availableStock) {
                newErrors.quantity = `Insufficient stock. Available: ${availableStock} ${inventory.product.unit}`
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !inventory) return

        try {
            setLoading(true)

            const response = await fetch(`/api/inventory/${inventory.id}/movements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: formData.type,
                    quantity: formData.quantity,
                    reason: formData.reason.trim(),
                    reference: formData.reference.trim() || undefined
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to record stock movement')
            }

            toast.success('Stock movement recorded successfully')
            onSave()
        } catch (error) {
            console.error('Error recording stock movement:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to record stock movement')
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

    const calculateNewStock = () => {
        if (!inventory) return 0

        switch (formData.type) {
            case 'IN':
            case 'RETURN':
                return inventory.quantity + formData.quantity
            case 'OUT':
            case 'DAMAGE':
            case 'TRANSFER':
                return inventory.quantity - formData.quantity
            case 'ADJUSTMENT':
                return formData.quantity // For adjustments, quantity is the final amount
            default:
                return inventory.quantity
        }
    }

    const selectedMovementType = MOVEMENT_TYPES.find(type => type.value === formData.type)
    const newStock = calculateNewStock()
    const availableStock = inventory ? inventory.quantity - inventory.reservedQty : 0

    if (!open || !inventory) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                Stock Movement
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Record stock movements for {inventory.product.name} at {inventory.shop.name}
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
                    {/* Current Stock Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">{inventory.product.name}</h3>
                                <p className="text-sm text-gray-600">{inventory.shop.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                    {availableStock} {inventory.product.unit}
                                </p>
                                <p className="text-sm text-gray-500">Available</p>
                            </div>
                        </div>
                        {inventory.reservedQty > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                                Total: {inventory.quantity} | Reserved: {inventory.reservedQty}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Movement Type */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Movement Type</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {MOVEMENT_TYPES.map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleInputChange('type', type.value)}
                                            className={`p-4 border rounded-lg text-left transition-all ${formData.type === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`h-5 w-5 ${type.color}`} />
                                                <div>
                                                    <div className="font-medium text-gray-900">{type.label}</div>
                                                    <div className="text-sm text-gray-500">{type.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Quantity</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.type === 'ADJUSTMENT' ? 'New Stock Level' : 'Quantity'} *
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.quantity === 0 ? '' : formData.quantity}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                                        handleInputChange('quantity', isNaN(value) ? 0 : value)
                                    }}
                                    placeholder={formData.type === 'ADJUSTMENT' ? 'Enter correct stock level' : 'Enter quantity'}
                                    className={errors.quantity ? 'border-red-500' : ''}
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                                )}

                                {/* Stock Preview */}
                                {formData.quantity > 0 && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-blue-800">
                                                New Stock Level:
                                            </span>
                                            <Badge className={newStock >= inventory.product.minStock
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }>
                                                {newStock} {inventory.product.unit}
                                            </Badge>
                                        </div>
                                        {newStock < inventory.product.minStock && (
                                            <p className="text-sm text-yellow-700 mt-1">
                                                ⚠️ Below minimum stock level ({inventory.product.minStock} {inventory.product.unit})
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Details</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason *
                                </label>
                                <Textarea
                                    value={formData.reason}
                                    onChange={(e) => handleInputChange('reason', e.target.value)}
                                    placeholder="Enter reason for this stock movement..."
                                    rows={3}
                                    className={errors.reason ? 'border-red-500' : ''}
                                />
                                {errors.reason && (
                                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference (Optional)
                                </label>
                                <Input
                                    value={formData.reference}
                                    onChange={(e) => handleInputChange('reference', e.target.value)}
                                    placeholder="Purchase order, sale ID, etc."
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
                                {loading ? 'Recording...' : 'Record Movement'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Store,
    X,
    MapPin,
    Phone,
    Mail,
    Building,
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface Shop {
    id: string
    name: string
    address: string
    phone?: string
    email?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    business: {
        id: string
        name: string
    }
    users?: {
        user: {
            id: string
            firstName: string
            lastName: string
            email?: string
        }
    }[]
    inventory?: {
        id: string
        quantity: number
        product: {
            id: string
            name: string
            sku?: string
        }
    }[]
    sales?: {
        id: string
        saleNumber: string
        finalAmount: number
        createdAt: string
        status: string
    }[]
    _count?: {
        inventory: number
        sales: number
        stockMovements: number
        users: number
    }
}

interface Business {
    id: string
    name: string
}

interface ShopDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    shop: Shop | null
    mode: 'create' | 'edit' | 'view'
    businesses: Business[]
    onSave: () => void
}

interface FormData {
    name: string
    address: string
    phone: string
    email: string
    businessId: string
    isActive: boolean
}

export function ShopDialog({
    open,
    onOpenChange,
    shop,
    mode,
    businesses,
    onSave
}: ShopDialogProps) {
    const [loading, setLoading] = useState(false)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [shopDetails, setShopDetails] = useState<Shop | null>(null)
    const [formData, setFormData] = useState<FormData>({
        name: '',
        address: '',
        phone: '',
        email: '',
        businessId: '',
        isActive: true
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Fetch detailed shop data for view mode
    useEffect(() => {
        if (open && mode === 'view' && shop) {
            fetchShopDetails(shop.id)
        }
    }, [open, mode, shop])

    const fetchShopDetails = async (shopId: string) => {
        try {
            setDetailsLoading(true)
            const response = await fetch(`/api/shops/${shopId}`)
            if (!response.ok) throw new Error('Failed to fetch shop details')
            const data = await response.json()
            setShopDetails(data)
        } catch (error) {
            console.error('Error fetching shop details:', error)
            toast.error('Failed to fetch shop details')
        } finally {
            setDetailsLoading(false)
        }
    }

    useEffect(() => {
        if (shop && (mode === 'edit' || mode === 'view')) {
            setFormData({
                name: shop.name,
                address: shop.address,
                phone: shop.phone || '',
                email: shop.email || '',
                businessId: shop.business.id,
                isActive: shop.isActive
            })
        } else if (mode === 'create') {
            setFormData({
                name: '',
                address: '',
                phone: '',
                email: '',
                businessId: businesses.length > 0 ? businesses[0].id : '',
                isActive: true
            })
        }
        setErrors({})
    }, [shop, mode, businesses])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = 'Shop name is required'
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.businessId) newErrors.businessId = 'Business is required'
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const url = mode === 'create' ? '/api/shops' : `/api/shops/${shop?.id}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const submitData = mode === 'create' ? formData : {
                name: formData.name,
                address: formData.address,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                isActive: formData.isActive
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
                throw new Error(error.error || 'Failed to save shop')
            }

            toast.success(mode === 'create' ? 'Shop created successfully' : 'Shop updated successfully')
            onSave()
        } catch (error) {
            console.error('Error saving shop:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save shop')
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

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Shop'
            case 'edit': return 'Edit Shop'
            case 'view': return 'Shop Details'
            default: return 'Shop'
        }
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

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Add a new shop location to your business'}
                            {mode === 'edit' && 'Update shop information and settings'}
                            {mode === 'view' && 'View shop details and statistics'}
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
                    {mode === 'view' ? (
                        <div className="space-y-6">
                            {detailsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="mt-2 text-muted-foreground">Loading shop details...</p>
                                </div>
                            ) : shopDetails ? (
                                <>
                                    {/* Shop Header */}
                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                            <Store className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">{shopDetails.name}</h3>
                                            <p className="text-gray-600">{shopDetails.business.name}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={shopDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {shopDetails.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Created {new Date(shopDetails.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">Address</p>
                                                    <p className="text-gray-600">{shopDetails.address}</p>
                                                </div>
                                            </div>
                                            {shopDetails.phone && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">Phone</p>
                                                        <p className="text-gray-600">{shopDetails.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {shopDetails.email && (
                                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">Email</p>
                                                        <p className="text-gray-600">{shopDetails.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Package className="h-5 w-5 text-green-600" />
                                                    <span className="text-sm font-medium text-green-600">Inventory</span>
                                                </div>
                                                <p className="text-2xl font-bold text-green-900 mt-1">
                                                    {shopDetails._count?.inventory || 0}
                                                </p>
                                                <p className="text-sm text-green-700">Products</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-600">Sales</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-900 mt-1">
                                                    {shopDetails._count?.sales || 0}
                                                </p>
                                                <p className="text-sm text-blue-700">Transactions</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-600">Movements</span>
                                                </div>
                                                <p className="text-2xl font-bold text-purple-900 mt-1">
                                                    {shopDetails._count?.stockMovements || 0}
                                                </p>
                                                <p className="text-sm text-purple-700">Stock changes</p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-5 w-5 text-orange-600" />
                                                    <span className="text-sm font-medium text-orange-600">Users</span>
                                                </div>
                                                <p className="text-2xl font-bold text-orange-900 mt-1">
                                                    {shopDetails._count?.users || 0}
                                                </p>
                                                <p className="text-sm text-orange-700">Assigned</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Sales */}
                                    {shopDetails.sales && shopDetails.sales.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Recent Sales</h4>
                                            <div className="space-y-2">
                                                {shopDetails.sales.map((sale) => (
                                                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <ShoppingCart className="h-5 w-5 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium">{sale.saleNumber}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(sale.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">${sale.finalAmount}</p>
                                                            <Badge className={getStatusColor(sale.status)}>
                                                                {sale.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assigned Users */}
                                    {shopDetails.users && shopDetails.users.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Assigned Users</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {shopDetails.users.map((userShop) => (
                                                    <div key={userShop.user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <Users className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {userShop.user.firstName} {userShop.user.lastName}
                                                            </p>
                                                            {userShop.user.email && (
                                                                <p className="text-sm text-gray-600">{userShop.user.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Failed to load shop details</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Shop Name *
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter shop name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Business *
                                        </label>
                                        <select
                                            value={formData.businessId}
                                            onChange={(e) => handleInputChange('businessId', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md ${errors.businessId ? 'border-red-500' : 'border-gray-300'}`}
                                            disabled={mode === 'edit'}
                                        >
                                            <option value="">Select a business</option>
                                            {businesses.map((business) => (
                                                <option key={business.id} value={business.id}>
                                                    {business.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.businessId && (
                                            <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address *
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Enter shop address"
                                        className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                        rows={3}
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {mode === 'edit' && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Status</h4>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">Shop is active</span>
                                        </label>
                                    </div>
                                </>
                            )}

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
                                    {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Shop' : 'Update Shop')}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
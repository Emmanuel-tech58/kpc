"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
    User,
    Mail,
    Phone,
    UserCheck,
    Building2,
    Calendar,
    Eye,
    EyeOff,
    X
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    phone?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    role: {
        id: string
        name: string
        description?: string
    }
    shops: Array<{
        id: string
        name: string
    }>
    _count: {
        sales: number
    }
}

interface Role {
    id: string
    name: string
    description?: string
}

interface Shop {
    id: string
    name: string
}

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    mode: 'create' | 'edit' | 'view'
    roles: Role[]
    shops: Shop[]
    onSave: () => void
}

interface FormData {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
    phone: string
    roleId: string
    isActive: boolean
    shopIds: string[]
}

export function UserDialog({
    open,
    onOpenChange,
    user,
    mode,
    roles,
    shops,
    onSave
}: UserDialogProps) {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleId: '',
        isActive: true,
        shopIds: []
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (user && (mode === 'edit' || mode === 'view')) {
            setFormData({
                email: user.email,
                username: user.username,
                password: '',
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                roleId: user.role.id,
                isActive: user.isActive,
                shopIds: user.shops.map(shop => shop.id)
            })
        } else if (mode === 'create') {
            setFormData({
                email: '',
                username: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                roleId: '',
                isActive: true,
                shopIds: []
            })
        }
        setErrors({})
    }, [user, mode])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address'

        if (!formData.username) newErrors.username = 'Username is required'
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'

        if (mode === 'create' && !formData.password) newErrors.password = 'Password is required'
        else if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.roleId) newErrors.roleId = 'Role is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            const url = mode === 'create' ? '/api/users' : `/api/users/${user?.id}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const submitData = { ...formData }
            if (mode === 'edit' && !submitData.password) {
                delete (submitData as any).password
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
                throw new Error(error.error || 'Failed to save user')
            }

            toast.success(mode === 'create' ? 'User created successfully' : 'User updated successfully')
            onSave()
        } catch (error) {
            console.error('Error saving user:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save user')
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

    const handleShopToggle = (shopId: string, checked: boolean) => {
        const newShopIds = checked
            ? [...formData.shopIds, shopId]
            : formData.shopIds.filter(id => id !== shopId)
        handleInputChange('shopIds', newShopIds)
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Create New User'
            case 'edit': return 'Edit User'
            case 'view': return 'User Details'
            default: return 'User'
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-900">
                                {getTitle()}
                            </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {mode === 'create' && 'Add a new user to the system with appropriate role and permissions.'}
                            {mode === 'edit' && 'Update user information and permissions.'}
                            {mode === 'view' && 'View user details and activity information.'}
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
                    {mode === 'view' && user ? (
                        <div className="space-y-6">
                            {/* User Avatar and Basic Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-gradient-to-br from-inventory-pink/20 to-inventory-purple/20 text-inventory-pink font-medium text-lg">
                                        {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-gray-600">@{user.username}</p>
                                    <Badge
                                        className={user.isActive
                                            ? "bg-green-100 text-green-800 mt-2"
                                            : "bg-red-100 text-red-800 mt-2"
                                        }
                                    >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{user.email}</p>
                                    </div>
                                    {user.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-gray-900">{user.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Role and Permissions */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Role & Permissions
                                </h4>
                                <div className="pl-6">
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {user.role.name}
                                    </Badge>
                                    {user.role.description && (
                                        <p className="text-sm text-gray-600 mt-2">{user.role.description}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Shop Access */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Shop Access
                                </h4>
                                <div className="pl-6">
                                    {user.shops.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {user.shops.map((shop) => (
                                                <Badge key={shop.id} variant="outline">
                                                    {shop.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No shops assigned</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Activity Stats */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Activity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Total Sales</label>
                                        <p className="text-base font-medium text-gray-900">{user._count.sales}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created</label>
                                        <p className="text-gray-900">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-gray-900">{format(new Date(user.updatedAt), 'MMM dd, yyyy')}</p>
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
                                            First Name *
                                        </label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Enter first name"
                                            className={errors.firstName ? 'border-red-500' : ''}
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Enter last name"
                                            className={errors.lastName ? 'border-red-500' : ''}
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username *
                                    </label>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        placeholder="Enter username"
                                        className={errors.username ? 'border-red-500' : ''}
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Contact Information</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone (Optional)
                                    </label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Security */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Security</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {mode === 'create' ? 'Password *' : 'New Password (leave empty to keep current)'}
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder={mode === 'create' ? "Enter password" : "Enter new password"}
                                            className={errors.password ? 'border-red-500' : ''}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Role and Permissions */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Role & Permissions</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={formData.roleId}
                                        onChange={(e) => handleInputChange('roleId', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select a role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name} {role.description && `- ${role.description}`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.roleId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Active Status</label>
                                        <div className="text-sm text-gray-500">
                                            Enable or disable user access to the system
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Shop Access */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Shop Access</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Shops
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                                        {shops.map((shop) => (
                                            <div key={shop.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={shop.id}
                                                    checked={formData.shopIds.includes(shop.id)}
                                                    onCheckedChange={(checked) => handleShopToggle(shop.id, checked as boolean)}
                                                />
                                                <label
                                                    htmlFor={shop.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {shop.name}
                                                </label>
                                            </div>
                                        ))}
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
                                    className="bg-gradient-to-r from-inventory-pink to-inventory-purple text-white hover:from-inventory-pink/90 hover:to-inventory-purple/90"
                                >
                                    {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
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
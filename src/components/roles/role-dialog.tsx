"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  X,
  Users,
  Package,
  ShoppingCart,
  Store,
  BarChart3,
  Settings,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Role {
  id: string
  name: string
  description?: string
  permissions: Record<string, string[]>
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  mode: 'create' | 'edit' | 'view'
  onSave: () => void
}

interface FormData {
  name: string
  description: string
  permissions: Record<string, string[]>
}

// Define available permissions
const AVAILABLE_PERMISSIONS = {
  users: {
    label: 'User Management',
    icon: Users,
    permissions: ['create', 'read', 'update', 'delete']
  },
  products: {
    label: 'Product Management',
    icon: Package,
    permissions: ['create', 'read', 'update', 'delete']
  },
  inventory: {
    label: 'Inventory Management',
    icon: BarChart3,
    permissions: ['create', 'read', 'update', 'delete', 'adjust']
  },
  sales: {
    label: 'Sales Management',
    icon: ShoppingCart,
    permissions: ['create', 'read', 'update', 'delete', 'refund']
  },
  shops: {
    label: 'Shop Management',
    icon: Store,
    permissions: ['create', 'read', 'update', 'delete']
  },
  settings: {
    label: 'System Settings',
    icon: Settings,
    permissions: ['read', 'update']
  }
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  mode,
  onSave
}: RoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    permissions: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (role && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {}
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        permissions: {}
      })
    }
    setErrors({})
  }, [role, mode])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = 'Role name is required'
    else if (formData.name.length < 2) newErrors.name = 'Role name must be at least 2 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      const url = mode === 'create' ? '/api/roles' : `/api/roles/${role?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save role')
      }

      toast.success(mode === 'create' ? 'Role created successfully' : 'Role updated successfully')
      onSave()
    } catch (error) {
      console.error('Error saving role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save role')
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

  const handlePermissionToggle = (module: string, permission: string, checked: boolean) => {
    const newPermissions = { ...formData.permissions }

    if (!newPermissions[module]) {
      newPermissions[module] = []
    }

    if (checked) {
      if (!newPermissions[module].includes(permission)) {
        newPermissions[module] = [...newPermissions[module], permission]
      }
    } else {
      newPermissions[module] = newPermissions[module].filter(p => p !== permission)
      if (newPermissions[module].length === 0) {
        delete newPermissions[module]
      }
    }

    handleInputChange('permissions', newPermissions)
  }

  const isPermissionChecked = (module: string, permission: string) => {
    return formData.permissions[module]?.includes(permission) || false
  }

  const getPermissionCount = (permissions: Record<string, string[]>) => {
    return Object.values(permissions).reduce((total, perms) => total + perms.length, 0)
  }

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Role'
      case 'edit': return 'Edit Role'
      case 'view': return 'Role Details'
      default: return 'Role'
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900">
                {getTitle()}
              </span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {mode === 'create' && 'Create a new role with specific permissions and access levels.'}
              {mode === 'edit' && 'Update role information and permissions.'}
              {mode === 'view' && 'View role details and permission information.'}
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
          {mode === 'view' && role ? (
            <div className="space-y-6">
              {/* Role Basic Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  {role.description && (
                    <p className="text-gray-600 mt-1">{role.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {role._count.users} {role._count.users === 1 ? 'user' : 'users'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getPermissionCount(role.permissions)} permissions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Permissions Display */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Permissions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(AVAILABLE_PERMISSIONS).map(([moduleKey, module]) => {
                    const ModuleIcon = module.icon
                    const modulePermissions = role.permissions[moduleKey] || []

                    return (
                      <div key={moduleKey} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <ModuleIcon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{module.label}</span>
                        </div>
                        <div className="space-y-2">
                          {module.permissions.map((permission) => (
                            <div key={permission} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${modulePermissions.includes(permission)
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                                }`} />
                              <span className={`text-sm capitalize ${modulePermissions.includes(permission)
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                                }`}>
                                {permission}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Activity Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Activity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{format(new Date(role.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">{format(new Date(role.updatedAt), 'MMM dd, yyyy')}</p>
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
                      Role Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter role name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter role description"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Permissions</h4>
                <p className="text-sm text-gray-600">
                  Select the permissions this role should have access to.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(AVAILABLE_PERMISSIONS).map(([moduleKey, module]) => {
                    const ModuleIcon = module.icon

                    return (
                      <div key={moduleKey} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <ModuleIcon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{module.label}</span>
                        </div>
                        <div className="space-y-2">
                          {module.permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${moduleKey}-${permission}`}
                                checked={isPermissionChecked(moduleKey, permission)}
                                onCheckedChange={(checked) =>
                                  handlePermissionToggle(moduleKey, permission, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={`${moduleKey}-${permission}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                              >
                                {permission}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
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
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
                >
                  {loading ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
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
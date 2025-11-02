"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Settings,
    User,
    Bell,
    Shield,
    Building,
    Save,
    Globe,
    Palette
} from "lucide-react"
import { toast } from 'sonner'

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('profile')

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    })

    const [businessData, setBusinessData] = useState({
        businessName: '',
        businessType: 'Retail',
        address: '',
        phone: '',
        email: '',
        currency: 'MWK',
        taxId: '',
        enableVat: false,
        vatRate: 16.5,
        vatNumber: '',
        includeOperatingExpenses: false,
        trackPurchaseOrders: true,
        multiCurrency: false,
        fiscalYearStart: 'january'
    })

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        lowStock: true,
        sales: true,
        reports: false,
        whatsapp: false
    })

    // Load settings on component mount
    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            // Load business settings
            const settingsResponse = await fetch('/api/settings')
            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json()
                if (settingsData.settings) {
                    setBusinessData(prev => ({ ...prev, ...settingsData.settings }))
                    // load notifications preferences if present
                    if (settingsData.settings.notifications) {
                        setNotifications(prev => ({ ...prev, ...settingsData.settings.notifications }))
                    }
                }
            }

            // Load user profile data
            const profileResponse = await fetch('/api/user/profile')
            if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                if (profileData.user) {
                    setProfileData({
                        firstName: profileData.user.firstName || '',
                        lastName: profileData.user.lastName || '',
                        email: profileData.user.email || '',
                        phone: profileData.user.phone || '',
                        address: profileData.user.address || ''
                    })
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Failed to load settings')
        } finally {
            setInitialLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // Save business settings
            const settingsResponse = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...businessData, notifications })
            })

            // Save profile data
            const profileResponse = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            })

            if (settingsResponse.ok && profileResponse.ok) {
                toast.success('Settings saved successfully')
            } else {
                throw new Error('Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="ml-3 text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account, business settings, and preferences
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Settings Tabs */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'profile', name: 'Profile', icon: User },
                                { id: 'business', name: 'Business', icon: Building },
                                { id: 'accounting', name: 'Accounting', icon: Settings },
                                { id: 'notifications', name: 'Notifications', icon: Bell },
                                { id: 'preferences', name: 'Preferences', icon: Palette },
                                { id: 'security', name: 'Security', icon: Shield }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your personal details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    First Name
                                                </label>
                                                <Input
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Name
                                                </label>
                                                <Input
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <Input
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address
                                            </label>
                                            <Input
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Business Tab */}
                        {activeTab === 'business' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Business Information</CardTitle>
                                        <CardDescription>Configure your business details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Business Name
                                            </label>
                                            <Input
                                                value={businessData.businessName}
                                                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Type
                                                </label>
                                                <select
                                                    value={businessData.businessType}
                                                    onChange={(e) => setBusinessData({ ...businessData, businessType: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value="retail">Retail</option>
                                                    <option value="wholesale">Wholesale</option>
                                                    <option value="manufacturing">Manufacturing</option>
                                                    <option value="service">Service</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Currency
                                                </label>
                                                <select
                                                    value={businessData.currency}
                                                    onChange={(e) => setBusinessData({ ...businessData, currency: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value="MWK">MWK - Malawian Kwacha</option>
                                                    <option value="USD">USD - US Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Business Address
                                            </label>
                                            <Input
                                                value={businessData.address}
                                                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Phone
                                                </label>
                                                <Input
                                                    value={businessData.phone}
                                                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Email
                                                </label>
                                                <Input
                                                    type="email"
                                                    value={businessData.email}
                                                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tax ID / Registration Number
                                            </label>
                                            <Input
                                                value={businessData.taxId}
                                                onChange={(e) => setBusinessData({ ...businessData, taxId: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tax & Accounting Settings</CardTitle>
                                        <CardDescription>Configure VAT and tax calculations for your business</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Enable VAT/Tax Calculations</h4>
                                                <p className="text-sm text-gray-600">Automatically add VAT to sales transactions</p>
                                            </div>
                                            <Switch
                                                checked={businessData.enableVat}
                                                onCheckedChange={(checked) => setBusinessData({ ...businessData, enableVat: checked })}
                                            />
                                        </div>
                                        {businessData.enableVat && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        VAT Rate (%)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="100"
                                                        value={businessData.vatRate}
                                                        onChange={(e) => setBusinessData({ ...businessData, vatRate: parseFloat(e.target.value) || 0 })}
                                                        placeholder="16.5"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Standard VAT rate in Malawi is 16.5%</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        VAT Number
                                                    </label>
                                                    <Input
                                                        value={businessData.vatNumber}
                                                        onChange={(e) => setBusinessData({ ...businessData, vatNumber: e.target.value })}
                                                        placeholder="VAT123456789"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h5 className="font-medium text-blue-900 mb-2">VAT Configuration Options:</h5>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• <strong>Enabled:</strong> VAT will be automatically calculated and added to all sales</li>
                                                <li>• <strong>Disabled:</strong> Prices entered are treated as final prices (VAT inclusive if applicable)</li>
                                                <li>• You can change this setting anytime based on your business needs</li>
                                                <li>• When disabled, you can still manually include VAT in your product prices</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Accounting Tab */}
                        {activeTab === 'accounting' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Accounting Preferences</CardTitle>
                                        <CardDescription>Configure how your business handles accounting and financial calculations</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Include Operating Expenses in Reports</h4>
                                                <p className="text-sm text-gray-600">Track additional business expenses beyond inventory costs</p>
                                            </div>
                                            <Switch
                                                checked={businessData.includeOperatingExpenses}
                                                onCheckedChange={(checked) => setBusinessData({ ...businessData, includeOperatingExpenses: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Track Purchase Orders</h4>
                                                <p className="text-sm text-gray-600">Enable purchase order management for better inventory control</p>
                                            </div>
                                            <Switch
                                                checked={businessData.trackPurchaseOrders}
                                                onCheckedChange={(checked) => setBusinessData({ ...businessData, trackPurchaseOrders: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Multi-Currency Support</h4>
                                                <p className="text-sm text-gray-600">Handle transactions in multiple currencies</p>
                                            </div>
                                            <Switch
                                                checked={businessData.multiCurrency}
                                                onCheckedChange={(checked) => setBusinessData({ ...businessData, multiCurrency: checked })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fiscal Year Start
                                            </label>
                                            <select
                                                value={businessData.fiscalYearStart}
                                                onChange={(e) => setBusinessData({ ...businessData, fiscalYearStart: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="january">January</option>
                                                <option value="april">April</option>
                                                <option value="july">July</option>
                                                <option value="october">October</option>
                                            </select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>Choose what notifications you want to receive</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>Choose what notifications you want to receive</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Email Notifications</h4>
                                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                                            </div>
                                            <Switch
                                                checked={notifications.email}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Push Notifications</h4>
                                                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                                            </div>
                                            <Switch
                                                checked={notifications.push}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Low Stock Alerts</h4>
                                                <p className="text-sm text-gray-600">Get notified when products are low in stock</p>
                                            </div>
                                            <Switch
                                                checked={notifications.lowStock}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Sales Notifications</h4>
                                                <p className="text-sm text-gray-600">Get notified about new sales and transactions</p>
                                            </div>
                                            <Switch
                                                checked={notifications.sales}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, sales: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Weekly Reports</h4>
                                                <p className="text-sm text-gray-600">Receive weekly business performance reports</p>
                                            </div>
                                            <Switch
                                                checked={notifications.reports}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">WhatsApp Notifications</h4>
                                                <p className="text-sm text-gray-600">Receive important alerts via WhatsApp</p>
                                            </div>
                                            <Switch
                                                checked={notifications.whatsapp}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Preferences</CardTitle>
                                        <CardDescription>Customize your system preferences</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Theme
                                                </label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                    <option value="light">Light</option>
                                                    <option value="dark">Dark</option>
                                                    <option value="system">System</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Language
                                                </label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                    <option value="en">English</option>
                                                    <option value="ny">Chichewa</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Date Format
                                                </label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Timezone
                                                </label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                    <option value="Africa/Blantyre">Africa/Blantyre (CAT)</option>
                                                    <option value="UTC">UTC</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security Settings</CardTitle>
                                        <CardDescription>Manage your account security</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h4 className="font-medium mb-2">Change Password</h4>
                                            <div className="space-y-3">
                                                <Input type="password" placeholder="Current Password" />
                                                <Input type="password" placeholder="New Password" />
                                                <Input type="password" placeholder="Confirm New Password" />
                                                <Button variant="outline">Update Password</Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Two-Factor Authentication</h4>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Session Management</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">Current Session</p>
                                                        <p className="text-sm text-gray-600">Chrome on Windows • Active now</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">Revoke</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
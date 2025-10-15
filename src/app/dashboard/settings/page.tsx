"use client"

import { useState } from 'react'
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
    const [activeTab, setActiveTab] = useState('profile')

    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+265 999 123 456',
        address: 'Blantyre, Malawi'
    })

    const [businessData, setBusinessData] = useState({
        businessName: 'My Business',
        businessType: 'Retail',
        address: 'Blantyre, Malawi',
        phone: '+265 999 123 456',
        email: 'business@example.com',
        currency: 'MWK',
        taxId: 'TAX123456'
    })

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        lowStock: true,
        sales: true,
        reports: false
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Settings saved successfully')
        } catch (error) {
            toast.error('Failed to save settings')
        } finally {
            setLoading(false)
        }
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
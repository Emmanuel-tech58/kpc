import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, Users, Package, TrendingUp, ArrowUpRight, Activity, DollarSign, ShoppingCart, AlertTriangle, BarChart3, Calendar, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    const { user } = session

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Welcome back, {user.firstName}!
                                </h1>
                                <p className="text-gray-600">Here's what's happening with your inventory today.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/sales/new">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                New Sale
                            </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/inventory/add">
                                <Package className="mr-2 h-5 w-5" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Modern Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl">
                                <DollarSign className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                +20.1%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">$45,231.89</p>
                            <p className="text-xs text-gray-500">from last month</p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
                                <ShoppingCart className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                +180.1%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Sales</p>
                            <p className="text-2xl font-semibold text-gray-900">2,350</p>
                            <p className="text-xs text-gray-500">transactions this month</p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                +19%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Products</p>
                            <p className="text-2xl font-semibold text-gray-900">12,234</p>
                            <p className="text-xs text-gray-500">in inventory</p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl">
                                <Store className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <Activity className="h-4 w-4" />
                                Active
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Active Shops</p>
                            <p className="text-2xl font-semibold text-gray-900">{user.shops?.length || 0}</p>
                            <p className="text-xs text-gray-500">locations</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Sales */}
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                    <ShoppingCart className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
                                    <p className="text-gray-600">You made 265 sales this month</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild className="bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl">
                                <Link href="/dashboard/sales">
                                    View All
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/80 transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Sale #{1000 + i}</p>
                                            <p className="text-sm text-gray-600">Customer {i}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">+${(Math.random() * 1000).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">
                                            <Clock className="inline h-3 w-3 mr-1" />
                                            {Math.floor(Math.random() * 60)} min ago
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile & Quick Actions */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
                                    <p className="text-gray-600">Account information</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Role:</span>
                                    <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200 capitalize">
                                        {user.role.toLowerCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Email:</span>
                                    <span className="text-sm text-gray-600 truncate max-w-32">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">Username:</span>
                                    <span className="text-sm text-gray-600">@{user.username}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shops Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Your Shops</h3>
                                    <p className="text-gray-600 text-sm">Assigned locations</p>
                                </div>
                            </div>

                            {user.shops && user.shops.length > 0 ? (
                                <div className="space-y-3">
                                    {user.shops.map((shop) => (
                                        <div key={shop.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 bg-orange-100 rounded-lg">
                                                    <Store className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <span className="font-medium text-gray-800">{shop.name}</span>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                                                Active
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Store className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-gray-600">No shops assigned</p>
                                    <p className="text-sm text-gray-500">Contact admin for access</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                                <p className="text-gray-600">Products that need restocking</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl">
                            <Link href="/dashboard/inventory/low-stock">
                                View All
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="text-center py-12">
                        <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl w-fit mx-auto mb-4">
                            <Package className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h4 className="text-base font-medium text-gray-900 mb-2">All Good!</h4>
                        <p className="text-gray-600 mb-1">No low stock items at the moment</p>
                        <p className="text-sm text-gray-500">All products are well stocked!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
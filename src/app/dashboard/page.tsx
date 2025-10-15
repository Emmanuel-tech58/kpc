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
                                <p className="text-gray-600">Here's your business overview and key metrics.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/sales">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                New Sale
                            </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                            <Link href="/dashboard/inventory">
                                <Package className="mr-2 h-5 w-5" />
                                Manage Inventory
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Enhanced Business Metrics Cards */}
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
                            <p className="text-2xl font-semibold text-gray-900">MWK 45,231.89</p>
                            <p className="text-xs text-gray-500">from last month</p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                +15.3%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                            <p className="text-2xl font-semibold text-gray-900">MWK 18,092.76</p>
                            <p className="text-xs text-gray-500">40% margin</p>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                                <BarChart3 className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                +12.8%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Net Profit</p>
                            <p className="text-2xl font-semibold text-green-600">MWK 9,046.38</p>
                            <p className="text-xs text-gray-500">20% net margin</p>
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
                            <p className="text-sm font-medium text-gray-600">Sales Count</p>
                            <p className="text-2xl font-semibold text-gray-900">2,350</p>
                            <p className="text-xs text-gray-500">transactions this month</p>
                        </div>
                    </div>
                </div>

                {/* Stock Alerts Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                                <p className="text-gray-600">Critical inventory levels requiring attention</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="bg-white/50 border-gray-200 hover:bg-white/80 rounded-xl">
                            <Link href="/dashboard/inventory">
                                Manage Stock
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Package className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Premium Coffee Beans</p>
                                    <p className="text-sm text-gray-600">SKU: PCB001 • Main Store</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Stock:</span>
                                    <span className="font-semibold text-red-600">3 / 20</span>
                                </div>
                                <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Package className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Organic Tea Leaves</p>
                                    <p className="text-sm text-gray-600">SKU: OTL002 • Branch Store</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Stock:</span>
                                    <span className="font-semibold text-yellow-600">8 / 15</span>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Low</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total items needing attention:</span>
                            <span className="font-semibold text-gray-900">2 products</span>
                        </div>
                    </div>
                </div>

                {/* Profit & Loss Summary */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Profit & Loss Summary</h3>
                                <p className="text-gray-600">Current month financial overview</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Revenue</span>
                                <span className="font-semibold text-green-600">MWK 45,231.89</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Less: Cost of Goods</span>
                                <span className="font-semibold text-red-600">MWK 27,139.13</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Gross Profit</span>
                                <span className="font-semibold text-blue-600">MWK 18,092.76</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Less: Operating Expenses</span>
                                <span className="font-semibold text-red-600">MWK 9,046.38</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Net Profit</span>
                                <span className="font-semibold text-green-600">MWK 9,046.38</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Profit Margin</span>
                                <span className="font-semibold text-purple-600">20.0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
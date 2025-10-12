import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Users, Package, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <div>Not authenticated</div>
    }

    const { user } = session

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user.firstName}!
                </h2>
                <p className="text-muted-foreground">
                    Here's what's happening with your inventory today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.shops?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active locations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Total products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Items need restocking
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>
                            Your account information and permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Role:</span>
                            <Badge variant="secondary" className="capitalize">
                                {user.role.toLowerCase()}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Username:</span>
                            <span className="text-sm text-muted-foreground">{user.username}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Shops</CardTitle>
                        <CardDescription>
                            Shops you have access to
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.shops && user.shops.length > 0 ? (
                            <div className="space-y-2">
                                {user.shops.map((shop) => (
                                    <div key={shop.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <Store className="h-4 w-4" />
                                            <span className="font-medium">{shop.name}</span>
                                        </div>
                                        <Badge variant="outline">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No shops assigned</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
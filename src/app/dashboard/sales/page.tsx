import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Filter, Plus } from "lucide-react"
import Link from "next/link"

export default function SalesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
                    <p className="text-muted-foreground">
                        View and manage all sales transactions
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/sales/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Sale
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search sales..." className="pl-10" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                        A list of all sales transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                        <p className="mb-4">Start making sales to see them here</p>
                        <Button asChild>
                            <Link href="/dashboard/sales/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Sale
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
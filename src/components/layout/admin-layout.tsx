"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserNav } from "@/components/auth/user-nav"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Store,
    BarChart3,
    Settings,
    Bell,
    Menu,
    Search,
    Plus,
    TrendingUp,
    Receipt,
    UserCheck,
    Building2,
    AlertTriangle,
    Tags,
    ChevronRight,
    Shield
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview and analytics",
        color: "text-inventory-blue"
    },
    {
        title: "Inventory",
        icon: Package,
        color: "text-inventory-green",
        items: [
            { title: "All Products", href: "/dashboard/inventory", icon: Package, color: "text-inventory-green" },
            { title: "Inventory Management", href: "/dashboard/inventory-management", icon: TrendingUp, color: "text-green-600" },
            { title: "Categories", href: "/dashboard/categories", icon: Tags, color: "text-orange-600" },
            { title: "Add Product", href: "/dashboard/inventory/add", icon: Plus, color: "text-inventory-green" },
            { title: "Low Stock", href: "/dashboard/inventory/low-stock", icon: AlertTriangle, color: "text-inventory-orange" },
        ]
    },
    {
        title: "Sales",
        icon: ShoppingCart,
        color: "text-inventory-purple",
        items: [
            { title: "All Sales", href: "/dashboard/sales", icon: Receipt, color: "text-inventory-purple" },
            { title: "New Sale", href: "/dashboard/sales/new", icon: Plus, color: "text-inventory-purple" },
            { title: "Reports", href: "/dashboard/sales/reports", icon: BarChart3, color: "text-inventory-purple" },
        ]
    },
    {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        description: "Manage customer information",
        color: "text-inventory-teal"
    },
    {
        title: "Shops",
        icon: Store,
        color: "text-inventory-orange",
        items: [
            { title: "All Shops", href: "/dashboard/shops", icon: Building2, color: "text-inventory-orange" },
            { title: "Add Shop", href: "/dashboard/shops/add", icon: Plus, color: "text-inventory-orange" },
        ]
    },
    {
        title: "Users",
        href: "/dashboard/users",
        icon: UserCheck,
        description: "Manage system users",
        color: "text-inventory-pink"
    },
    {
        title: "Roles",
        href: "/dashboard/roles",
        icon: Shield,
        description: "Manage user roles and permissions",
        color: "text-purple-600"
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: TrendingUp,
        description: "Business insights and reports",
        color: "text-inventory-yellow"
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "System configuration",
        color: "text-gray-500"
    },
]

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const pathname = usePathname()

    const toggleExpanded = (itemTitle: string) => {
        setExpandedItems(prev =>
            prev.includes(itemTitle)
                ? prev.filter(item => item !== itemTitle)
                : [...prev, itemTitle]
        )
    }

    // Auto-expand sections that contain the current path
    useEffect(() => {
        const currentSection = sidebarItems.find(item =>
            item.items?.some(subItem => pathname.startsWith(subItem.href))
        )
        if (currentSection && !expandedItems.includes(currentSection.title)) {
            setExpandedItems(prev => [...prev, currentSection.title])
        }
    }, [pathname, expandedItems])

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-inventory-purple to-inventory-blue">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
                        <Package className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-white">KPC Inventory</span>
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                    {sidebarItems.map((item, index) => (
                        <div key={index}>
                            {item.items ? (
                                <div className="space-y-1">
                                    {/* Collapsible Section Header */}
                                    <button
                                        onClick={() => toggleExpanded(item.title)}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground group",
                                            expandedItems.includes(item.title) || item.items.some((subItem: any) => pathname.startsWith(subItem.href))
                                                ? "bg-accent/50 text-accent-foreground shadow-sm"
                                                : "text-muted-foreground hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={cn("mr-2 h-4 w-4 transition-colors", item.color)} />
                                            {item.title}
                                        </div>
                                        <div className={cn(
                                            "transition-transform duration-200",
                                            expandedItems.includes(item.title) ? "rotate-90" : "rotate-0"
                                        )}>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </button>

                                    {/* Collapsible Sub-items */}
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-200 ease-in-out",
                                        expandedItems.includes(item.title) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                        <div className="ml-6 space-y-1 border-l border-border pl-3 py-1">
                                            {item.items.map((subItem: any) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={cn(
                                                        "flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                                                        pathname === subItem.href
                                                            ? "bg-accent text-accent-foreground font-medium shadow-sm"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    <subItem.icon className={cn("mr-2 h-3 w-3", subItem.color)} />
                                                    {subItem.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href!}
                                                className={cn(
                                                    "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                    pathname === item.href
                                                        ? "bg-accent text-accent-foreground font-medium"
                                                        : "text-muted-foreground"
                                                )}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <item.icon className={cn("mr-2 h-4 w-4", (item as any).color)} />
                                                {item.title}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{item.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>System Online</span>
                </div>
            </div>
        </div>
    )

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background">
                {/* Desktop Sidebar */}
                <div className="hidden w-64 border-r bg-card lg:block">
                    <SidebarContent />
                </div>

                {/* Mobile Sidebar */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Navigation */}
                    <header className="flex h-16 items-center border-b bg-gradient-to-r from-white to-gray-50 px-6 shadow-sm">
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden"
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                            </Sheet>

                            {/* Search */}
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search products, sales, customers..."
                                    className="w-64 pl-10"
                                />
                            </div>
                        </div>

                        <div className="ml-auto flex items-center space-x-4">
                            {/* Quick Actions */}
                            <div className="hidden items-center space-x-2 md:flex">
                                <Button size="sm" className="h-8 bg-inventory-purple hover:bg-inventory-purple/90">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Sale
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-inventory-green text-inventory-green hover:bg-inventory-green hover:text-white">
                                    <Package className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="relative hover:bg-inventory-blue/10">
                                <Bell className="h-5 w-5 text-inventory-blue" />
                                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-inventory-red">
                                    3
                                </Badge>
                            </Button>

                            <Separator orientation="vertical" className="h-6" />

                            {/* User Navigation */}
                            <UserNav />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    )
}
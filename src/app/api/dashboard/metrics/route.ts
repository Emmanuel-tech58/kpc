import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

        // Current month sales
        const currentMonthSales = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: currentMonth,
                    lt: currentMonthEnd
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                inventory: {
                                    select: {
                                        costPrice: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Last month sales for comparison
        const lastMonthSales = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: lastMonth,
                    lt: lastMonthEnd
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                inventory: {
                                    select: {
                                        costPrice: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Calculate current month metrics
        const currentRevenue = currentMonthSales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0)
        const currentSalesCount = currentMonthSales.length

        let currentCostOfGoods = 0
        currentMonthSales.forEach(sale => {
            sale.items.forEach(item => {
                const costPrice = item.product.inventory[0]?.costPrice || 0
                currentCostOfGoods += Number(costPrice) * item.quantity
            })
        })

        const currentGrossProfit = currentRevenue - currentCostOfGoods
        const currentOperatingExpenses = 0 // No operating expenses for inventory management
        const currentNetProfit = currentGrossProfit // Net profit = gross profit for product sales

        // Calculate last month metrics for comparison
        const lastRevenue = lastMonthSales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0)
        const lastSalesCount = lastMonthSales.length

        let lastCostOfGoods = 0
        lastMonthSales.forEach(sale => {
            sale.items.forEach(item => {
                const costPrice = item.product.inventory[0]?.costPrice || 0
                lastCostOfGoods += Number(costPrice) * item.quantity
            })
        })

        const lastGrossProfit = lastRevenue - lastCostOfGoods
        const lastNetProfit = lastGrossProfit // Net profit = gross profit for product sales

        // Calculate growth percentages
        const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0
        const salesGrowth = lastSalesCount > 0 ? ((currentSalesCount - lastSalesCount) / lastSalesCount) * 100 : 0
        const profitGrowth = lastNetProfit > 0 ? ((currentNetProfit - lastNetProfit) / lastNetProfit) * 100 : 0

        // Get total products count
        const totalProducts = await prisma.product.count({
            where: {
                isActive: true
            }
        })

        // Get active shops count
        const activeShops = await prisma.shop.count()

        // Get recent sales for dashboard
        const recentSales = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED'
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        })

        // Get low stock count
        const lowStockItems = await prisma.inventory.findMany({
            include: {
                product: true
            }
        })

        const lowStockCount = lowStockItems.filter(item => {
            const availableStock = item.quantity - item.reservedQty
            return availableStock <= item.product.minStock
        }).length

        return NextResponse.json({
            success: true,
            metrics: {
                // Current period metrics
                totalRevenue: currentRevenue,
                totalSales: currentSalesCount,
                totalProducts: totalProducts,
                activeShops: activeShops,
                grossProfit: currentGrossProfit,
                netProfit: currentNetProfit,
                profitMargin: currentRevenue > 0 ? (currentNetProfit / currentRevenue) * 100 : 0,
                costOfGoodsSold: currentCostOfGoods,
                operatingExpenses: currentOperatingExpenses,
                averageOrderValue: currentSalesCount > 0 ? currentRevenue / currentSalesCount : 0,

                // Growth metrics
                revenueGrowth: revenueGrowth,
                salesGrowth: salesGrowth,
                profitGrowth: profitGrowth,

                // Alerts
                lowStockCount: lowStockCount
            },
            recentSales: recentSales.map(sale => ({
                id: sale.id,
                saleNumber: sale.saleNumber,
                finalAmount: sale.finalAmount,
                customerName: sale.customer?.name || 'Walk-in Customer',
                createdAt: sale.createdAt,
                userName: `${sale.user.firstName} ${sale.user.lastName}`
            }))
        })

    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics' },
            { status: 500 }
        )
    }
}
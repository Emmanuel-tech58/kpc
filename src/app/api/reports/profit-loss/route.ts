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

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'month'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Calculate date range based on period
        let dateFilter: any = {}
        const now = new Date()

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            }
        } else {
            switch (period) {
                case 'day':
                    dateFilter = {
                        createdAt: {
                            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                        }
                    }
                    break
                case 'week':
                    const weekStart = new Date(now)
                    weekStart.setDate(now.getDate() - now.getDay())
                    dateFilter = {
                        createdAt: {
                            gte: weekStart,
                            lt: now
                        }
                    }
                    break
                case 'month':
                default:
                    dateFilter = {
                        createdAt: {
                            gte: new Date(now.getFullYear(), now.getMonth(), 1),
                            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                        }
                    }
                    break
                case 'quarter':
                    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
                    dateFilter = {
                        createdAt: {
                            gte: quarterStart,
                            lt: now
                        }
                    }
                    break
                case 'year':
                    dateFilter = {
                        createdAt: {
                            gte: new Date(now.getFullYear(), 0, 1),
                            lt: new Date(now.getFullYear() + 1, 0, 1)
                        }
                    }
                    break
            }
        }

        // Get sales data with items for profit calculation
        const sales = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED',
                ...dateFilter
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                inventory: {
                                    select: {
                                        costPrice: true,
                                        sellingPrice: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Calculate metrics
        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0)
        const salesCount = sales.length

        // Calculate cost of goods sold and total discounts
        let totalCostOfGoodsSold = 0
        let totalDiscounts = 0
        let totalBeforeDiscounts = 0

        sales.forEach(sale => {
            sale.items.forEach(item => {
                // Find the cost price from inventory
                const costPrice = item.product.inventory[0]?.costPrice || 0
                totalCostOfGoodsSold += Number(costPrice) * item.quantity

                // Track discounts
                totalDiscounts += Number(item.discount)
                totalBeforeDiscounts += (Number(item.unitPrice) * item.quantity)
            })
        })

        const grossProfit = totalRevenue - totalCostOfGoodsSold

        // For inventory management, net profit = gross profit (Revenue - COGS)
        // No operating expenses since this is product-focused, not full business accounting
        const operatingExpenses = 0
        const netProfit = grossProfit // Net profit is simply the profit from products sold
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0

        const discountPercentage = totalBeforeDiscounts > 0 ? (totalDiscounts / totalBeforeDiscounts) * 100 : 0

        const report = {
            period: period.charAt(0).toUpperCase() + period.slice(1),
            revenue: totalRevenue,
            costOfGoodsSold: totalCostOfGoodsSold,
            grossProfit: grossProfit,
            operatingExpenses: operatingExpenses,
            netProfit: netProfit,
            profitMargin: profitMargin,
            salesCount: salesCount,
            averageOrderValue: averageOrderValue,
            totalDiscounts: totalDiscounts,
            totalBeforeDiscounts: totalBeforeDiscounts,
            discountPercentage: discountPercentage
        }

        return NextResponse.json({
            success: true,
            reports: [report]
        })

    } catch (error) {
        console.error('Error fetching profit/loss data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profit/loss data' },
            { status: 500 }
        )
    }
}
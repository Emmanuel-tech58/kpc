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

        // Get business settings for VAT and accounting preferences
        const businessSettings = await prisma.businessSettings.findFirst({
            where: { userId: session.user.id }
        })

        // Calculate metrics with proper VAT handling
        let totalRevenue = 0
        let totalTax = 0
        let totalRevenueExcludingTax = 0
        const salesCount = sales.length

        // Calculate cost of goods sold and total discounts
        let totalCostOfGoodsSold = 0
        let totalDiscounts = 0
        let totalBeforeDiscounts = 0

        sales.forEach(sale => {
            // Handle VAT based on business settings
            const saleRevenue = Number(sale.finalAmount)
            const saleTax = Number(sale.tax)

            totalRevenue += saleRevenue
            totalTax += saleTax

            // If VAT is enabled, revenue excluding tax is finalAmount - tax
            // If VAT is disabled, all amounts are treated as final (VAT inclusive if applicable)
            if (businessSettings?.enableVat) {
                totalRevenueExcludingTax += (saleRevenue - saleTax)
            } else {
                totalRevenueExcludingTax += saleRevenue
            }

            sale.items.forEach(item => {
                // Find the cost price from inventory
                const costPrice = item.product.inventory[0]?.costPrice || 0
                totalCostOfGoodsSold += Number(costPrice) * item.quantity

                // Track discounts
                totalDiscounts += Number(item.discount)
                totalBeforeDiscounts += (Number(item.unitPrice) * item.quantity)
            })
        })

        // Calculate profits based on whether VAT is enabled
        const revenueForProfitCalculation = businessSettings?.enableVat ? totalRevenueExcludingTax : totalRevenue
        const grossProfit = revenueForProfitCalculation - totalCostOfGoodsSold

        // Operating expenses (if enabled in settings)
        let operatingExpenses = 0
        if (businessSettings?.includeOperatingExpenses) {
            const expenses = await prisma.operatingExpense.findMany({
                where: {
                    userId: session.user.id,
                    ...dateFilter
                }
            })
            operatingExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
        }

        const netProfit = grossProfit - operatingExpenses
        const profitMargin = revenueForProfitCalculation > 0 ? (netProfit / revenueForProfitCalculation) * 100 : 0
        const averageOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0

        const discountPercentage = totalBeforeDiscounts > 0 ? (totalDiscounts / totalBeforeDiscounts) * 100 : 0

        const report = {
            period: period.charAt(0).toUpperCase() + period.slice(1),
            revenue: revenueForProfitCalculation, // Revenue used for profit calculations
            totalRevenue: totalRevenue, // Total revenue including VAT
            totalTax: totalTax, // Total VAT/tax collected
            costOfGoodsSold: totalCostOfGoodsSold,
            grossProfit: grossProfit,
            operatingExpenses: operatingExpenses,
            netProfit: netProfit,
            profitMargin: profitMargin,
            salesCount: salesCount,
            averageOrderValue: averageOrderValue,
            totalDiscounts: totalDiscounts,
            totalBeforeDiscounts: totalBeforeDiscounts,
            discountPercentage: discountPercentage,
            vatEnabled: businessSettings?.enableVat || false,
            vatRate: businessSettings?.vatRate || 0
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
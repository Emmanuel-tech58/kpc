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

        // Calculate date range
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
            }
        }

        // Get cash inflows (completed sales)
        const salesInflows = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED',
                ...dateFilter
            },
            select: {
                id: true,
                saleNumber: true,
                finalAmount: true,
                tax: true,
                discount: true,
                paymentMethod: true,
                createdAt: true,
                customer: {
                    select: {
                        name: true
                    }
                }
            }
        })

        // Get cash outflows (completed purchases)
        const purchaseOutflows = await prisma.purchase.findMany({
            where: {
                status: 'COMPLETED',
                ...dateFilter
            },
            select: {
                id: true,
                purchaseNumber: true,
                finalAmount: true,
                tax: true,
                discount: true,
                createdAt: true,
                supplier: {
                    select: {
                        name: true
                    }
                }
            }
        })

        // Calculate totals
        const totalInflows = salesInflows.reduce((sum, sale) => sum + Number(sale.finalAmount), 0)
        const totalOutflows = purchaseOutflows.reduce((sum, purchase) => sum + Number(purchase.finalAmount), 0)
        const netCashFlow = totalInflows - totalOutflows

        // Calculate by payment method
        const cashFlowByPaymentMethod = salesInflows.reduce((acc: any, sale) => {
            const method = sale.paymentMethod
            if (!acc[method]) {
                acc[method] = { inflow: 0, count: 0 }
            }
            acc[method].inflow += Number(sale.finalAmount)
            acc[method].count += 1
            return acc
        }, {})

        // Calculate tax collected
        const totalTaxCollected = salesInflows.reduce((sum, sale) => sum + Number(sale.tax), 0)
        const totalTaxPaid = purchaseOutflows.reduce((sum, purchase) => sum + Number(purchase.tax), 0)
        const netTaxLiability = totalTaxCollected - totalTaxPaid

        return NextResponse.json({
            success: true,
            cashFlow: {
                period: period.charAt(0).toUpperCase() + period.slice(1),
                totalInflows: totalInflows,
                totalOutflows: totalOutflows,
                netCashFlow: netCashFlow,
                salesCount: salesInflows.length,
                purchaseCount: purchaseOutflows.length,
                totalTaxCollected: totalTaxCollected,
                totalTaxPaid: totalTaxPaid,
                netTaxLiability: netTaxLiability,
                cashFlowByPaymentMethod: cashFlowByPaymentMethod
            },
            transactions: {
                inflows: salesInflows.map(sale => ({
                    id: sale.id,
                    type: 'SALE',
                    reference: sale.saleNumber,
                    amount: sale.finalAmount,
                    tax: sale.tax,
                    paymentMethod: sale.paymentMethod,
                    date: sale.createdAt,
                    description: `Sale to ${sale.customer?.name || 'Walk-in Customer'}`
                })),
                outflows: purchaseOutflows.map(purchase => ({
                    id: purchase.id,
                    type: 'PURCHASE',
                    reference: purchase.purchaseNumber,
                    amount: purchase.finalAmount,
                    tax: purchase.tax,
                    date: purchase.createdAt,
                    description: `Purchase from ${purchase.supplier.name}`
                }))
            }
        })

    } catch (error) {
        console.error('Error fetching cash flow data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch cash flow data' },
            { status: 500 }
        )
    }
}
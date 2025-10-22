import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get user session
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = await params
        const shopId = id

        // Check if shop exists
        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        })

        if (!shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            )
        }

        // Get metrics
        const [totalRevenue, totalSales, totalProducts, lowStockCount] = await Promise.all([
            // Total revenue from completed sales
            prisma.sale.aggregate({
                where: {
                    shopId: shopId,
                    status: 'COMPLETED'
                },
                _sum: {
                    finalAmount: true
                }
            }),
            // Total number of completed sales
            prisma.sale.count({
                where: {
                    shopId: shopId,
                    status: 'COMPLETED'
                }
            }),
            // Total products in inventory
            prisma.inventory.count({
                where: {
                    shopId: shopId,
                    quantity: {
                        gt: 0
                    }
                }
            }),
            // Low stock items - need to get inventory with product data
            prisma.inventory.findMany({
                where: {
                    shopId: shopId
                },
                include: {
                    product: {
                        select: {
                            minStock: true
                        }
                    }
                }
            }).then(items =>
                items.filter(item => item.quantity <= item.product.minStock).length
            )
        ])

        const metrics = {
            totalRevenue: totalRevenue._sum.finalAmount || 0,
            totalSales: totalSales,
            totalProducts: totalProducts,
            lowStockCount: lowStockCount
        }

        return NextResponse.json({ metrics })
    } catch (error) {
        console.error('Error fetching shop metrics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shop metrics' },
            { status: 500 }
        )
    }
}
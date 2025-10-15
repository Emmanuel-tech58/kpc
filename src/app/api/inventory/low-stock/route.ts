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
        const limit = parseInt(searchParams.get('limit') || '50')
        const shopId = searchParams.get('shopId')

        // Build where clause
        let whereClause: any = {}

        if (shopId) {
            whereClause.shopId = shopId
        }

        // Get all inventory items
        const inventoryItems = await prisma.inventory.findMany({
            where: whereClause,
            include: {
                product: {
                    include: {
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                shop: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            take: limit
        })

        // Filter for low stock items
        const lowStockItems = inventoryItems.filter(item => {
            const availableStock = item.quantity - item.reservedQty
            return availableStock <= item.product.minStock
        })

        // Transform the data
        const transformedItems = lowStockItems.map(item => {
            const availableStock = item.quantity - item.reservedQty

            return {
                id: item.id,
                name: item.product.name,
                sku: item.product.sku,
                currentStock: availableStock,
                totalStock: item.quantity,
                reservedStock: item.reservedQty,
                minStock: item.product.minStock,
                maxStock: item.product.maxStock,
                shop: {
                    id: item.shop.id,
                    name: item.shop.name
                },
                category: {
                    name: item.product.category.name
                },
                stockStatus: availableStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                stockPercentage: item.product.minStock > 0 ? (availableStock / item.product.minStock) * 100 : 0,
                lastUpdated: item.lastUpdated
            }
        })

        // Sort by urgency (out of stock first, then by stock percentage)
        transformedItems.sort((a, b) => {
            if (a.stockStatus === 'OUT_OF_STOCK' && b.stockStatus !== 'OUT_OF_STOCK') return -1
            if (b.stockStatus === 'OUT_OF_STOCK' && a.stockStatus !== 'OUT_OF_STOCK') return 1
            return a.stockPercentage - b.stockPercentage
        })

        // Get summary statistics
        const outOfStockCount = transformedItems.filter(item => item.stockStatus === 'OUT_OF_STOCK').length
        const lowStockCount = transformedItems.filter(item => item.stockStatus === 'LOW_STOCK').length

        return NextResponse.json({
            success: true,
            items: transformedItems,
            summary: {
                totalLowStockItems: transformedItems.length,
                outOfStockCount: outOfStockCount,
                lowStockCount: lowStockCount
            }
        })

    } catch (error) {
        console.error('Error fetching low stock items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch low stock items' },
            { status: 500 }
        )
    }
}
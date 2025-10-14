import { prisma } from './prisma'

// Define the enum locally to avoid import issues
enum NotificationType {
    LOW_STOCK = 'LOW_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    HIGH_STOCK = 'HIGH_STOCK',
    SALE_COMPLETED = 'SALE_COMPLETED',
    PURCHASE_RECEIVED = 'PURCHASE_RECEIVED',
    SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export interface LowStockItem {
    productId: string
    productName: string
    sku: string
    currentStock: number
    minStock: number
    shopId: string
    shopName: string
}

export interface ProfitCalculation {
    totalRevenue: number
    totalCost: number
    grossProfit: number
    profitMargin: number
}

// Check for low stock items across all shops
export async function checkLowStock(): Promise<LowStockItem[]> {
    const lowStockItems = await prisma.inventory.findMany({
        include: {
            product: true,
            shop: true
        }
    })

    return lowStockItems
        .filter((item: any) => item.quantity <= item.product.minStock)
        .map((item: any) => ({
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            currentStock: item.quantity,
            minStock: item.product.minStock,
            shopId: item.shopId,
            shopName: item.shop.name
        }))
}

// Create low stock notifications
export async function createLowStockNotifications(userId: string) {
    const lowStockItems = await checkLowStock()

    for (const item of lowStockItems) {
        await prisma.notification.create({
            data: {
                type: NotificationType.LOW_STOCK,
                title: 'Low Stock Alert',
                message: `${item.productName} (${item.sku}) is running low in ${item.shopName}. Current: ${item.currentStock}, Min: ${item.minStock}`,
                userId,
                data: {
                    productId: item.productId,
                    shopId: item.shopId,
                    currentStock: item.currentStock,
                    minStock: item.minStock
                }
            }
        })
    }
}

// Calculate profit for a specific period
export async function calculateProfit(
    shopId?: string,
    startDate?: Date,
    endDate?: Date
): Promise<ProfitCalculation> {
    const whereClause: {
        shopId?: string
        createdAt?: {
            gte?: Date
            lte?: Date
        }
    } = {}

    if (shopId) whereClause.shopId = shopId
    if (startDate || endDate) {
        whereClause.createdAt = {}
        if (startDate) whereClause.createdAt.gte = startDate
        if (endDate) whereClause.createdAt.lte = endDate
    }

    const sales = await prisma.sale.findMany({
        where: {
            ...whereClause,
            status: 'COMPLETED'
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            inventory: {
                                where: shopId ? { shopId } : undefined
                            }
                        }
                    }
                }
            }
        }
    })

    let totalRevenue = 0
    let totalCost = 0

    for (const sale of sales) {
        totalRevenue += Number(sale.finalAmount)

        for (const item of sale.items) {
            const inventory = item.product.inventory[0]
            if (inventory) {
                totalCost += Number(inventory.costPrice) * item.quantity
            }
        }
    }

    const grossProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin
    }
}

// Update inventory after sale
export async function updateInventoryAfterSale(saleId: string) {
    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: { items: true }
    })

    if (!sale) throw new Error('Sale not found')

    for (const item of sale.items) {
        // Update inventory quantity
        await prisma.inventory.updateMany({
            where: {
                productId: item.productId,
                shopId: sale.shopId
            },
            data: {
                quantity: {
                    decrement: item.quantity
                }
            }
        })

        // Create stock movement record
        await prisma.stockMovement.create({
            data: {
                type: 'OUT',
                quantity: -item.quantity,
                reason: 'Sale',
                reference: saleId,
                productId: item.productId,
                shopId: sale.shopId,
                userId: sale.userId
            }
        })
    }
}

// Update inventory after purchase
export async function updateInventoryAfterPurchase(purchaseId: string, shopId: string, userId: string) {
    const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true }
    })

    if (!purchase) throw new Error('Purchase not found')

    for (const item of purchase.items) {
        const unitPriceNumber = Number(item.unitPrice)

        // Update or create inventory record
        await prisma.inventory.upsert({
            where: {
                productId_shopId: {
                    productId: item.productId,
                    shopId
                }
            },
            update: {
                quantity: {
                    increment: item.quantity
                },
                costPrice: item.unitPrice
            },
            create: {
                productId: item.productId,
                shopId,
                quantity: item.quantity,
                costPrice: item.unitPrice,
                sellingPrice: unitPriceNumber * 1.3 // Default 30% markup
            }
        })

        // Create stock movement record
        await prisma.stockMovement.create({
            data: {
                type: 'IN',
                quantity: item.quantity,
                reason: 'Purchase',
                reference: purchaseId,
                productId: item.productId,
                shopId,
                userId
            }
        })
    }
}
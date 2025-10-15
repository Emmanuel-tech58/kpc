import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createSaleSchema = z.object({
    shopId: z.string().min(1, 'Shop is required'),
    customerId: z.string().optional().nullable().transform(val => val === '' ? null : val),
    items: z.array(z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price cannot be negative'),
        discount: z.number().min(0, 'Discount cannot be negative').default(0)
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT']),
    notes: z.string().optional().nullable().transform(val => val === '' ? null : val)
})

export async function GET(request: NextRequest) {
    try {
        // Get user session
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const shopId = searchParams.get('shopId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        const where: any = {}

        // Filter by shop
        if (shopId) {
            where.shopId = shopId
        }

        // Filter by date range
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) {
                where.createdAt.gte = new Date(startDate)
            }
            if (endDate) {
                // Add 1 day to endDate to include the entire end date
                const endDateTime = new Date(endDate)
                endDateTime.setDate(endDateTime.getDate() + 1)
                where.createdAt.lt = endDateTime
            }
        }

        // Filter by search term (sale number, customer name)
        if (search) {
            where.OR = [
                { saleNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { notes: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                where,
                skip,
                take: limit,
                include: {
                    shop: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.sale.count({ where })
        ])

        return NextResponse.json({
            sales,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching sales:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sales' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validatedData = createSaleSchema.parse(body)

        // Generate sale number
        const saleCount = await prisma.sale.count()
        const saleNumber = `SALE-${String(saleCount + 1).padStart(6, '0')}`

        // Calculate totals
        let totalAmount = 0
        const processedItems = validatedData.items.map(item => {
            const itemTotal = (item.unitPrice * item.quantity) - item.discount
            totalAmount += itemTotal
            return {
                ...item,
                totalPrice: itemTotal
            }
        })

        const finalAmount = totalAmount

        // Create sale with items in a transaction
        const sale = await prisma.$transaction(async (tx) => {
            // Create the sale
            const newSale = await tx.sale.create({
                data: {
                    saleNumber,
                    totalAmount,
                    discount: 0,
                    tax: 0,
                    finalAmount,
                    paymentMethod: validatedData.paymentMethod,
                    status: 'COMPLETED',
                    notes: validatedData.notes,
                    shopId: validatedData.shopId,
                    userId: session.user.id,
                    customerId: validatedData.customerId
                }
            })

            // Create sale items
            await tx.saleItem.createMany({
                data: processedItems.map(item => ({
                    saleId: newSale.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    discount: item.discount
                }))
            })

            // Update inventory and create stock movements
            for (const item of processedItems) {
                // Update inventory
                await tx.inventory.updateMany({
                    where: {
                        productId: item.productId,
                        shopId: validatedData.shopId
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                })

                // Create stock movement
                await tx.stockMovement.create({
                    data: {
                        type: 'OUT',
                        quantity: item.quantity,
                        reason: 'Sale',
                        reference: newSale.id,
                        productId: item.productId,
                        shopId: validatedData.shopId,
                        userId: session.user.id
                    }
                })
            }

            return newSale
        })

        // Fetch the complete sale with relations
        const completeSale = await prisma.sale.findUnique({
            where: { id: sale.id },
            include: {
                shop: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(completeSale)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating sale:', error)
        return NextResponse.json(
            { error: 'Failed to create sale' },
            { status: 500 }
        )
    }
}
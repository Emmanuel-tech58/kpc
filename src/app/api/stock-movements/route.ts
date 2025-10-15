import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createStockMovementSchema = z.object({
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE']),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    reason: z.string().optional(),
    reference: z.string().optional(),
    productId: z.string().min(1, 'Product is required'),
    shopId: z.string().min(1, 'Shop is required')
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
        const productId = searchParams.get('productId')
        const type = searchParams.get('type')

        const skip = (page - 1) * limit

        const where: any = {}

        // Filter by shop
        if (shopId) {
            where.shopId = shopId
        }

        // Filter by product
        if (productId) {
            where.productId = productId
        }

        // Filter by type
        if (type) {
            where.type = type
        }

        // Filter by search term (product name, reason, reference)
        if (search) {
            where.OR = [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { product: { sku: { contains: search, mode: 'insensitive' } } },
                { reason: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                skip,
                take: limit,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            unit: true
                        }
                    },
                    shop: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockMovement.count({ where })
        ])

        return NextResponse.json({
            movements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching stock movements:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stock movements' },
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
        const validatedData = createStockMovementSchema.parse(body)

        // Create stock movement and update inventory in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the stock movement
            const movement = await tx.stockMovement.create({
                data: {
                    ...validatedData,
                    userId: session.user.id
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            unit: true
                        }
                    },
                    shop: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })

            // Update inventory based on movement type
            const inventory = await tx.inventory.findFirst({
                where: {
                    productId: validatedData.productId,
                    shopId: validatedData.shopId
                }
            })

            if (inventory) {
                let quantityChange = 0

                switch (validatedData.type) {
                    case 'IN':
                    case 'RETURN':
                        quantityChange = validatedData.quantity
                        break
                    case 'OUT':
                    case 'DAMAGE':
                        quantityChange = -validatedData.quantity
                        break
                    case 'ADJUSTMENT':
                        // For adjustments, the quantity represents the final amount
                        quantityChange = validatedData.quantity - inventory.quantity
                        break
                    case 'TRANSFER':
                        // For transfers, this would be handled differently
                        // For now, treat as OUT
                        quantityChange = -validatedData.quantity
                        break
                }

                await tx.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        quantity: {
                            increment: quantityChange
                        }
                    }
                })
            }

            return movement
        })

        return NextResponse.json(result)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating stock movement:', error)
        return NextResponse.json(
            { error: 'Failed to create stock movement' },
            { status: 500 }
        )
    }
}
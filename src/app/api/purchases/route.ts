import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPurchaseSchema = z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    shopId: z.string().min(1, 'Shop is required'),
    items: z.array(z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Unit price cannot be negative'),
        discount: z.number().min(0, 'Discount cannot be negative').default(0)
    })).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    deliveryDate: z.string().optional()
})

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search')
        const supplierId = searchParams.get('supplierId')
        const shopId = searchParams.get('shopId')
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        // Build where clause
        let whereClause: any = {}

        if (search) {
            whereClause.OR = [
                { purchaseNumber: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (supplierId) whereClause.supplierId = supplierId
        if (shopId) whereClause.shopId = shopId
        if (status) whereClause.status = status

        if (startDate || endDate) {
            whereClause.createdAt = {}
            if (startDate) whereClause.createdAt.gte = new Date(startDate)
            if (endDate) whereClause.createdAt.lte = new Date(endDate)
        }

        const [purchases, totalCount] = await Promise.all([
            prisma.purchase.findMany({
                where: whereClause,
                include: {
                    supplier: {
                        select: {
                            id: true,
                            name: true
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
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.purchase.count({ where: whereClause })
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json({
            success: true,
            purchases,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: totalPages
            }
        })

    } catch (error) {
        console.error('Error fetching purchases:', error)
        return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = createPurchaseSchema.parse(body)

        // Generate purchase number
        const purchaseCount = await prisma.purchase.count()
        const purchaseNumber = `PUR-${String(purchaseCount + 1).padStart(6, '0')}`

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

        // Calculate tax (16.5% VAT for Malawi)
        const taxRate = 0.165
        const taxAmount = totalAmount * taxRate
        const finalAmount = totalAmount + taxAmount

        // Create purchase with items in a transaction
        const purchase = await prisma.$transaction(async (tx) => {
            // Create the purchase
            const newPurchase = await tx.purchase.create({
                data: {
                    purchaseNumber,
                    totalAmount,
                    discount: 0,
                    tax: taxAmount,
                    finalAmount,
                    status: 'PENDING',
                    notes: validatedData.notes,
                    deliveryDate: validatedData.deliveryDate ? new Date(validatedData.deliveryDate) : null,
                    supplierId: validatedData.supplierId,
                    shopId: validatedData.shopId,
                    userId: session.user.id
                }
            })

            // Create purchase items
            const purchaseItems = await Promise.all(
                processedItems.map(item =>
                    tx.purchaseItem.create({
                        data: {
                            purchaseId: newPurchase.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            discount: item.discount
                        }
                    })
                )
            )

            return { ...newPurchase, items: purchaseItems }
        })

        return NextResponse.json({
            success: true,
            purchase
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating purchase:', error)
        return NextResponse.json(
            { error: 'Failed to create purchase' },
            { status: 500 }
        )
    }
}
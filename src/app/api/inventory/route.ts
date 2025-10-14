import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createInventorySchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    shopId: z.string().min(1, 'Shop is required'),
    quantity: z.number().min(0, 'Quantity cannot be negative'),
    costPrice: z.number().min(0, 'Cost price cannot be negative'),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative')
})

const updateInventorySchema = z.object({
    quantity: z.number().min(0, 'Quantity cannot be negative').optional(),
    costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative').optional()
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
        const categoryId = searchParams.get('categoryId')
        const lowStock = searchParams.get('lowStock') === 'true'

        const skip = (page - 1) * limit

        const where: any = {}

        // Filter by shop
        if (shopId) {
            where.shopId = shopId
        }

        // Filter by product search
        if (search || categoryId) {
            where.product = {}

            if (search) {
                where.product.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { barcode: { contains: search, mode: 'insensitive' } }
                ]
            }

            if (categoryId) {
                where.product.categoryId = categoryId
            }
        }

        const [inventory, total] = await Promise.all([
            prisma.inventory.findMany({
                where,
                skip,
                take: limit,
                include: {
                    product: {
                        include: {
                            category: true,
                            supplier: true
                        }
                    },
                    shop: true
                },
                orderBy: { lastUpdated: 'desc' }
            }),
            prisma.inventory.count({ where })
        ])

        // Filter for low stock if requested
        let filteredInventory = inventory
        if (lowStock) {
            filteredInventory = inventory.filter(inv =>
                inv.quantity <= inv.product.minStock
            )
        }

        return NextResponse.json({
            inventory: filteredInventory,
            pagination: {
                page,
                limit,
                total: lowStock ? filteredInventory.length : total,
                pages: Math.ceil((lowStock ? filteredInventory.length : total) / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching inventory:', error)
        return NextResponse.json(
            { error: 'Failed to fetch inventory' },
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
        const validatedData = createInventorySchema.parse(body)

        // Check if inventory record already exists for this product-shop combination
        const existingInventory = await prisma.inventory.findFirst({
            where: {
                productId: validatedData.productId,
                shopId: validatedData.shopId
            }
        })

        if (existingInventory) {
            return NextResponse.json(
                { error: 'Inventory record already exists for this product in this shop' },
                { status: 400 }
            )
        }

        // Create inventory record
        const inventory = await prisma.inventory.create({
            data: validatedData,
            include: {
                product: {
                    include: {
                        category: true,
                        supplier: true
                    }
                },
                shop: true
            }
        })

        // Create initial stock movement record
        await prisma.stockMovement.create({
            data: {
                type: 'IN',
                quantity: validatedData.quantity,
                reason: 'Initial stock',
                productId: validatedData.productId,
                shopId: validatedData.shopId,
                userId: session.user.id
            }
        })

        return NextResponse.json(inventory)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating inventory:', error)
        return NextResponse.json(
            { error: 'Failed to create inventory' },
            { status: 500 }
        )
    }
}
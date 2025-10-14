import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateInventorySchema = z.object({
    quantity: z.number().min(0, 'Quantity cannot be negative').optional(),
    costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative').optional()
})

const adjustStockSchema = z.object({
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.number().min(1, 'Quantity must be positive'),
    reason: z.string().min(1, 'Reason is required')
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const inventory = await prisma.inventory.findUnique({
            where: { id },
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

        if (!inventory) {
            return NextResponse.json(
                { error: 'Inventory record not found' },
                { status: 404 }
            )
        }

        // Get recent stock movements
        const stockMovements = await prisma.stockMovement.findMany({
            where: {
                productId: inventory.productId,
                shopId: inventory.shopId
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return NextResponse.json({
            ...inventory,
            stockMovements
        })
    } catch (error) {
        console.error('Error fetching inventory:', error)
        return NextResponse.json(
            { error: 'Failed to fetch inventory' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()
        const validatedData = updateInventorySchema.parse(body)

        const inventory = await prisma.inventory.update({
            where: { id },
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

        return NextResponse.json(inventory)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error updating inventory:', error)
        return NextResponse.json(
            { error: 'Failed to update inventory' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        // Check if inventory exists
        const existingInventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        product: {
                            select: {
                                saleItems: true
                            }
                        }
                    }
                }
            }
        })

        if (!existingInventory) {
            return NextResponse.json(
                { error: 'Inventory record not found' },
                { status: 404 }
            )
        }

        // Delete inventory record
        await prisma.inventory.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Inventory record deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting inventory:', error)
        return NextResponse.json(
            { error: 'Failed to delete inventory' },
            { status: 500 }
        )
    }
}
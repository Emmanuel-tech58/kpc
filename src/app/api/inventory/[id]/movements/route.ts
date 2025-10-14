import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const stockMovementSchema = z.object({
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE']),
    quantity: z.number().min(1, 'Quantity must be positive'),
    reason: z.string().min(1, 'Reason is required'),
    reference: z.string().optional()
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()
        const validatedData = stockMovementSchema.parse(body)

        // Get inventory record
        const inventory = await prisma.inventory.findUnique({
            where: { id },
            include: {
                product: true,
                shop: true
            }
        })

        if (!inventory) {
            return NextResponse.json(
                { error: 'Inventory record not found' },
                { status: 404 }
            )
        }

        // Calculate new quantity based on movement type
        let newQuantity = inventory.quantity

        switch (validatedData.type) {
            case 'IN':
            case 'RETURN':
                newQuantity += validatedData.quantity
                break
            case 'OUT':
            case 'DAMAGE':
                newQuantity -= validatedData.quantity
                if (newQuantity < 0) {
                    return NextResponse.json(
                        { error: 'Insufficient stock for this operation' },
                        { status: 400 }
                    )
                }
                break
            case 'ADJUSTMENT':
                // For adjustments, the quantity represents the final amount
                newQuantity = validatedData.quantity
                break
            case 'TRANSFER':
                // For transfers, this would be handled differently
                // This is a simplified version
                newQuantity -= validatedData.quantity
                if (newQuantity < 0) {
                    return NextResponse.json(
                        { error: 'Insufficient stock for transfer' },
                        { status: 400 }
                    )
                }
                break
        }

        // Create stock movement record and update inventory in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create stock movement
            const stockMovement = await tx.stockMovement.create({
                data: {
                    type: validatedData.type,
                    quantity: validatedData.quantity,
                    reason: validatedData.reason,
                    reference: validatedData.reference,
                    productId: inventory.productId,
                    shopId: inventory.shopId,
                    userId: 'system' // TODO: Get from session
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            username: true
                        }
                    }
                }
            })

            // Update inventory quantity
            const updatedInventory = await tx.inventory.update({
                where: { id },
                data: { quantity: newQuantity },
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

            return { stockMovement, inventory: updatedInventory }
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
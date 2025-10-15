import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const updateShopSchema = z.object({
    name: z.string().min(1, 'Shop name is required').optional(),
    address: z.string().min(1, 'Address is required').optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    isActive: z.boolean().optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const shop = await prisma.shop.findUnique({
            where: { id: params.id },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                inventory: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true
                            }
                        }
                    },
                    take: 10,
                    orderBy: { lastUpdated: 'desc' }
                },
                sales: {
                    select: {
                        id: true,
                        saleNumber: true,
                        finalAmount: true,
                        createdAt: true,
                        status: true
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        inventory: true,
                        sales: true,
                        stockMovements: true,
                        users: true
                    }
                }
            }
        })

        if (!shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(shop)
    } catch (error) {
        console.error('Error fetching shop:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shop' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const body = await request.json()
        const validatedData = updateShopSchema.parse(body)

        // Check if shop exists
        const existingShop = await prisma.shop.findUnique({
            where: { id: params.id }
        })

        if (!existingShop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            )
        }

        // Check if name is being changed and if it conflicts
        if (validatedData.name && validatedData.name !== existingShop.name) {
            const nameConflict = await prisma.shop.findFirst({
                where: {
                    name: validatedData.name,
                    businessId: existingShop.businessId,
                    id: { not: params.id }
                }
            })

            if (nameConflict) {
                return NextResponse.json(
                    { error: 'Shop with this name already exists in this business' },
                    { status: 400 }
                )
            }
        }

        const shop = await prisma.shop.update({
            where: { id: params.id },
            data: validatedData,
            include: {
                business: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        inventory: true,
                        sales: true,
                        stockMovements: true
                    }
                }
            }
        })

        return NextResponse.json(shop)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error updating shop:', error)
        return NextResponse.json(
            { error: 'Failed to update shop' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        // Check if shop exists
        const existingShop = await prisma.shop.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        inventory: true,
                        sales: true,
                        stockMovements: true
                    }
                }
            }
        })

        if (!existingShop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            )
        }

        // Check if shop has related data
        if (existingShop._count.inventory > 0 || existingShop._count.sales > 0 || existingShop._count.stockMovements > 0) {
            // Soft delete - just deactivate
            const shop = await prisma.shop.update({
                where: { id: params.id },
                data: { isActive: false }
            })

            return NextResponse.json({
                message: 'Shop deactivated successfully (has related data)',
                shop
            })
        } else {
            // Hard delete if no related data
            await prisma.shop.delete({
                where: { id: params.id }
            })

            return NextResponse.json({
                message: 'Shop deleted successfully'
            })
        }
    } catch (error) {
        console.error('Error deleting shop:', error)
        return NextResponse.json(
            { error: 'Failed to delete shop' },
            { status: 500 }
        )
    }
}
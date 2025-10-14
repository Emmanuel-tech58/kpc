import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateUserSchema = z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    roleId: z.string().optional(),
    isActive: z.boolean().optional(),
    shopIds: z.array(z.string()).optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null // Only find non-deleted users
            },
            include: {
                role: true,
                shops: {
                    include: {
                        shop: true
                    }
                },
                _count: {
                    select: {
                        sales: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found or has been deleted' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...user,
            password: undefined,
            shops: user.shops.map(us => us.shop)
        })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const validatedData = updateUserSchema.parse(body)

        // Check if user exists and is not deleted
        const existingUser = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null // Only find non-deleted users
            }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found or has been deleted' },
                { status: 404 }
            )
        }

        // Check if email or username already exists in active users (excluding current user)
        if (validatedData.email || validatedData.username) {
            const duplicateUser = await prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: params.id } },
                        { deletedAt: null }, // Only check active users
                        {
                            OR: [
                                ...(validatedData.email ? [{ email: validatedData.email }] : []),
                                ...(validatedData.username ? [{ username: validatedData.username }] : [])
                            ]
                        }
                    ]
                }
            })

            if (duplicateUser) {
                return NextResponse.json(
                    { error: 'Email or username already exists' },
                    { status: 400 }
                )
            }
        }

        // Prepare update data
        const updateData: any = { ...validatedData }
        delete updateData.shopIds

        // Hash password if provided
        if (validatedData.password) {
            updateData.password = await bcrypt.hash(validatedData.password, 12)
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            include: {
                role: true
            }
        })

        // Update shop assignments if provided
        if (validatedData.shopIds !== undefined) {
            // Remove existing shop assignments
            await prisma.userShop.deleteMany({
                where: { userId: params.id }
            })

            // Add new shop assignments
            if (validatedData.shopIds.length > 0) {
                await prisma.userShop.createMany({
                    data: validatedData.shopIds.map(shopId => ({
                        userId: params.id,
                        shopId
                    }))
                })
            }
        }

        return NextResponse.json({
            ...user,
            password: undefined
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if user exists and is not already deleted
        const existingUser = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null // Only find non-deleted users
            },
            include: {
                _count: {
                    select: {
                        sales: true,
                        stockMovements: true
                    }
                }
            }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found or already deleted' },
                { status: 404 }
            )
        }

        // Always perform soft delete
        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                isActive: false,
                deletedAt: new Date(),
                // TODO: Add deletedBy field when we have session management
                // deletedBy: session.user.id
            },
            include: { role: true }
        })

        const hasAssociatedRecords = existingUser._count.sales > 0 || existingUser._count.stockMovements > 0

        return NextResponse.json({
            message: hasAssociatedRecords
                ? 'User soft deleted (has associated records)'
                : 'User soft deleted successfully',
            user: {
                ...user,
                password: undefined
            },
            canRestore: true
        })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createShopSchema = z.object({
    name: z.string().min(1, 'Shop name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    businessId: z.string().min(1, 'Business is required')
})

const updateShopSchema = z.object({
    name: z.string().min(1, 'Shop name is required').optional(),
    address: z.string().min(1, 'Address is required').optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    isActive: z.boolean().optional()
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
        const includeInactive = searchParams.get('includeInactive') === 'true'

        const skip = (page - 1) * limit

        const where: any = {}

        // Filter by active status
        if (!includeInactive) {
            where.isActive = true
        }

        // Filter by search term
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [shops, total] = await Promise.all([
            prisma.shop.findMany({
                where,
                skip,
                take: limit,
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
                },
                orderBy: { name: 'asc' }
            }),
            prisma.shop.count({ where })
        ])

        return NextResponse.json({
            shops,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching shops:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shops' },
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
        const validatedData = createShopSchema.parse(body)

        // Check if shop with same name already exists
        const existingShop = await prisma.shop.findFirst({
            where: {
                name: validatedData.name,
                businessId: validatedData.businessId
            }
        })

        if (existingShop) {
            return NextResponse.json(
                { error: 'Shop with this name already exists in this business' },
                { status: 400 }
            )
        }

        const shop = await prisma.shop.create({
            data: validatedData,
            include: {
                business: {
                    select: {
                        id: true,
                        name: true
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

        console.error('Error creating shop:', error)
        return NextResponse.json(
            { error: 'Failed to create shop' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    roleId: z.string(),
    shopIds: z.array(z.string()).optional()
})

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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const roleId = searchParams.get('roleId') || ''
        const isActive = searchParams.get('isActive')
        const includeDeleted = searchParams.get('includeDeleted') === 'true'

        const skip = (page - 1) * limit

        const where: any = {}

        // By default, exclude soft-deleted users
        if (!includeDeleted) {
            where.deletedAt = null
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (roleId) {
            where.roleId = roleId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
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
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ])

        const formattedUsers = users.map(user => ({
            ...user,
            password: undefined, // Don't send password
            shops: user.shops.map(us => us.shop)
        }))

        return NextResponse.json({
            users: formattedUsers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = createUserSchema.parse(body)

        // Check if email or username already exists in active users
        const existingUser = await prisma.user.findFirst({
            where: {
                AND: [
                    { deletedAt: null }, // Only check active users
                    {
                        OR: [
                            { email: validatedData.email },
                            { username: validatedData.username }
                        ]
                    }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email or username already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                username: validatedData.username,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                phone: validatedData.phone,
                roleId: validatedData.roleId
            },
            include: {
                role: true
            }
        })

        // Assign shops if provided
        if (validatedData.shopIds && validatedData.shopIds.length > 0) {
            await prisma.userShop.createMany({
                data: validatedData.shopIds.map(shopId => ({
                    userId: user.id,
                    shopId
                }))
            })
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

        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
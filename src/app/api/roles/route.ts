import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
    permissions: z.record(z.string(), z.array(z.string())).optional()
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [roles, total] = await Promise.all([
            prisma.role.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            users: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.role.count({ where })
        ])

        return NextResponse.json({
            roles,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching roles:', error)
        return NextResponse.json(
            { error: 'Failed to fetch roles' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = createRoleSchema.parse(body)

        // Check if role name already exists
        const existingRole = await prisma.role.findUnique({
            where: { name: validatedData.name }
        })

        if (existingRole) {
            return NextResponse.json(
                { error: 'Role name already exists' },
                { status: 400 }
            )
        }

        // Create role
        const role = await prisma.role.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                permissions: (validatedData.permissions || {}) as any
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        })

        return NextResponse.json(role)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating role:', error)
        return NextResponse.json(
            { error: 'Failed to create role' },
            { status: 500 }
        )
    }
}
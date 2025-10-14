import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().nullable().optional(),
    parentId: z.string().nullable().optional()
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const parentId = searchParams.get('parentId')

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (parentId !== null && parentId !== '') {
            where.parentId = parentId === 'null' ? null : parentId
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit,
                include: {
                    parent: true,
                    children: true,
                    _count: {
                        select: {
                            products: true,
                            children: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.category.count({ where })
        ])

        return NextResponse.json({
            categories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = createCategorySchema.parse(body)

        // Check if category name already exists in the same parent level
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: validatedData.name,
                parentId: validatedData.parentId
            }
        })

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category name already exists at this level' },
                { status: 400 }
            )
        }

        // Get the default business ID (you might want to get this from session/auth)
        const business = await prisma.business.findFirst()
        if (!business) {
            return NextResponse.json(
                { error: 'No business found' },
                { status: 400 }
            )
        }

        const category = await prisma.category.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                parentId: validatedData.parentId,
                businessId: business.id
            },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating category:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
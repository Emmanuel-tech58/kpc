import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().nullable().optional(),
    parentId: z.string().nullable().optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    include: {
                        _count: {
                            select: {
                                products: true,
                                children: true
                            }
                        }
                    }
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        isActive: true
                    }
                },
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error fetching category:', error)
        return NextResponse.json(
            { error: 'Failed to fetch category' },
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
        const validatedData = updateCategorySchema.parse(body)

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id }
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Prevent setting parent to self or creating circular references
        if (validatedData.parentId === id) {
            return NextResponse.json(
                { error: 'Category cannot be its own parent' },
                { status: 400 }
            )
        }

        // Check for circular reference
        if (validatedData.parentId) {
            const wouldCreateCircle = await checkCircularReference(id, validatedData.parentId)
            if (wouldCreateCircle) {
                return NextResponse.json(
                    { error: 'This would create a circular reference' },
                    { status: 400 }
                )
            }
        }

        // Check if name already exists at the same level (excluding current category)
        const duplicateName = await prisma.category.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    { name: validatedData.name },
                    { parentId: validatedData.parentId }
                ]
            }
        })

        if (duplicateName) {
            return NextResponse.json(
                { error: 'Category name already exists at this level' },
                { status: 400 }
            )
        }

        const category = await prisma.category.update({
            where: { id },
            data: validatedData,
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

        console.error('Error updating category:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
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
        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Check if category has products or subcategories
        if (existingCategory._count.products > 0 || existingCategory._count.children > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete category with products or subcategories',
                    details: `This category has ${existingCategory._count.products} product(s) and ${existingCategory._count.children} subcategory(ies). Please move or delete them first.`
                },
                { status: 400 }
            )
        }

        // Delete category
        await prisma.category.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Category deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}

// Helper function to check for circular references
async function checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
    let currentParentId = parentId

    while (currentParentId) {
        if (currentParentId === categoryId) {
            return true
        }

        const parent = await prisma.category.findUnique({
            where: { id: currentParentId },
            select: { parentId: true }
        })

        if (!parent) break
        currentParentId = parent.parentId
    }

    return false
}
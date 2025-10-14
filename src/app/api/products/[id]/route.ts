import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    unit: z.string().default('pcs'),
    minStock: z.number().min(0).default(0),
    maxStock: z.number().min(0).nullable().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    supplierId: z.string().min(1, 'Supplier is required'),
    isActive: z.boolean().default(true)
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true,
                inventory: {
                    include: {
                        shop: true
                    }
                },
                _count: {
                    select: {
                        saleItems: true,
                        purchaseItems: true,
                        stockMovements: true
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
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
        const validatedData = updateProductSchema.parse(body)

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        })

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Check if SKU already exists (excluding current product, if SKU is provided)
        if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
            const duplicateSku = await prisma.product.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { sku: validatedData.sku }
                    ]
                }
            })

            if (duplicateSku) {
                return NextResponse.json(
                    { error: 'SKU already exists' },
                    { status: 400 }
                )
            }
        }

        // Check if barcode already exists (excluding current product)
        if (validatedData.barcode && validatedData.barcode !== existingProduct.barcode) {
            const duplicateBarcode = await prisma.product.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { barcode: validatedData.barcode }
                    ]
                }
            })

            if (duplicateBarcode) {
                return NextResponse.json(
                    { error: 'Barcode already exists' },
                    { status: 400 }
                )
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: validatedData,
            include: {
                category: true,
                supplier: true,
                inventory: {
                    include: {
                        shop: true
                    }
                },
                _count: {
                    select: {
                        saleItems: true,
                        purchaseItems: true,
                        stockMovements: true
                    }
                }
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
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
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        saleItems: true,
                        purchaseItems: true,
                        inventory: true
                    }
                }
            }
        })

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Check if product has associated records
        const hasRecords = existingProduct._count.saleItems > 0 ||
            existingProduct._count.purchaseItems > 0 ||
            existingProduct._count.inventory > 0

        if (hasRecords) {
            return NextResponse.json(
                {
                    error: 'Cannot delete product with existing records',
                    details: 'This product has associated sales, purchases, or inventory records. Consider deactivating it instead.'
                },
                { status: 400 }
            )
        }

        // Delete product
        await prisma.product.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
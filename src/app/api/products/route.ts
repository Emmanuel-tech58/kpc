import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const categoryId = searchParams.get('categoryId') || ''
        const supplierId = searchParams.get('supplierId') || ''
        const isActive = searchParams.get('isActive')
        const lowStock = searchParams.get('lowStock') === 'true'

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (supplierId) {
            where.supplierId = supplierId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
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
                            purchaseItems: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ])

        // Filter for low stock if requested
        let filteredProducts = products
        if (lowStock) {
            filteredProducts = products.filter(product => {
                const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
                return totalStock <= product.minStock
            })
        }

        return NextResponse.json({
            products: filteredProducts,
            pagination: {
                page,
                limit,
                total: lowStock ? filteredProducts.length : total,
                pages: Math.ceil((lowStock ? filteredProducts.length : total) / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = createProductSchema.parse(body)

        // Check if SKU already exists (if provided)
        if (validatedData.sku) {
            const existingSku = await prisma.product.findUnique({
                where: { sku: validatedData.sku }
            })

            if (existingSku) {
                return NextResponse.json(
                    { error: 'SKU already exists' },
                    { status: 400 }
                )
            }
        }

        // Check if barcode already exists (if provided)
        if (validatedData.barcode) {
            const existingBarcode = await prisma.product.findUnique({
                where: { barcode: validatedData.barcode }
            })

            if (existingBarcode) {
                return NextResponse.json(
                    { error: 'Barcode already exists' },
                    { status: 400 }
                )
            }
        }

        const product = await prisma.product.create({
            data: validatedData,
            include: {
                category: true,
                supplier: true
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

        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
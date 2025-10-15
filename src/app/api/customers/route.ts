import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional()
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

        const skip = (page - 1) * limit

        const where: any = {}

        // Filter by search term
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.customer.count({ where })
        ])

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
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
        const validatedData = createCustomerSchema.parse(body)

        // Check if customer with same email already exists
        if (validatedData.email) {
            const existingCustomer = await prisma.customer.findUnique({
                where: { email: validatedData.email }
            })

            if (existingCustomer) {
                return NextResponse.json(
                    { error: 'Customer with this email already exists' },
                    { status: 400 }
                )
            }
        }

        const customer = await prisma.customer.create({
            data: validatedData
        })

        return NextResponse.json(customer)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating customer:', error)
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        )
    }
}
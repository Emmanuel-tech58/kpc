import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createExpenseSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    category: z.string().min(1, 'Category is required'),
    date: z.string().transform(str => new Date(str)),
    notes: z.string().optional().nullable().transform(val => val === '' ? null : val),
    isRecurring: z.boolean().default(false),
    recurringPeriod: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable()
})

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const category = searchParams.get('category')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit
        const where: any = { userId: session.user.id }

        // Filter by category
        if (category) {
            where.category = category
        }

        // Filter by date range
        if (startDate || endDate) {
            where.date = {}
            if (startDate) {
                where.date.gte = new Date(startDate)
            }
            if (endDate) {
                const endDateTime = new Date(endDate)
                endDateTime.setDate(endDateTime.getDate() + 1)
                where.date.lt = endDateTime
            }
        }

        const [expenses, total] = await Promise.all([
            prisma.operatingExpense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' }
            }),
            prisma.operatingExpense.count({ where })
        ])

        // Calculate totals
        const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

        return NextResponse.json({
            expenses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            summary: {
                totalAmount,
                count: expenses.length
            }
        })

    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json(
            { error: 'Failed to fetch expenses' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = createExpenseSchema.parse(body)

        const expense = await prisma.operatingExpense.create({
            data: {
                ...validatedData,
                userId: session.user.id
            }
        })

        return NextResponse.json(expense)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating expense:', error)
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        )
    }
}
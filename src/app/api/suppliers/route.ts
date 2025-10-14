import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        })

        return NextResponse.json(suppliers)
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        )
    }
}
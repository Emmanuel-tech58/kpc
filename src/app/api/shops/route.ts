import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const shops = await prisma.shop.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(shops)
    } catch (error) {
        console.error('Error fetching shops:', error)
        return NextResponse.json(
            { error: 'Failed to fetch shops' },
            { status: 500 }
        )
    }
}
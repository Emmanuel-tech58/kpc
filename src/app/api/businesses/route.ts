import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

        const businesses = await prisma.business.findMany({
            select: {
                id: true,
                name: true,
                description: true
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({
            businesses
        })
    } catch (error) {
        console.error('Error fetching businesses:', error)
        return NextResponse.json(
            { error: 'Failed to fetch businesses' },
            { status: 500 }
        )
    }
}
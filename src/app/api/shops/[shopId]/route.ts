import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
    request: Request,
    { params }: { params: { shopId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shopId } = params

    try {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                business: true,
            },
        })

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        return NextResponse.json({ shop })
    } catch (error) {
        console.error('Error fetching shop:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

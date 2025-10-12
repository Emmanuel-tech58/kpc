import { NextRequest, NextResponse } from 'next/server'
import { calculateProfit } from '@/lib/inventory-utils'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const shopId = searchParams.get('shopId') || undefined
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

        const profit = await calculateProfit(shopId, startDate, endDate)
        return NextResponse.json(profit)
    } catch (error) {
        console.error('Error calculating profit:', error)
        return NextResponse.json(
            { error: 'Failed to calculate profit' },
            { status: 500 }
        )
    }
}
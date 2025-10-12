import { NextResponse } from 'next/server'
import { checkLowStock } from '@/lib/inventory-utils'

export async function GET() {
    try {
        const lowStockItems = await checkLowStock()
        return NextResponse.json(lowStockItems)
    } catch (error) {
        console.error('Error fetching low stock items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch low stock items' },
            { status: 500 }
        )
    }
}
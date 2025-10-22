import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    currency: z.string().optional(),
    taxId: z.string().optional(),
    enableVat: z.boolean().optional(),
    vatRate: z.number().min(0).max(100).optional(),
    vatNumber: z.string().optional(),
    includeOperatingExpenses: z.boolean().optional(),
    trackPurchaseOrders: z.boolean().optional(),
    multiCurrency: z.boolean().optional(),
    fiscalYearStart: z.string().optional()
})

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's business settings
        const settings = await prisma.businessSettings.findFirst({
            where: {
                userId: session.user.id
            }
        })

        // Return default settings if none exist
        const defaultSettings = {
            businessName: 'My Business',
            businessType: 'Retail',
            address: 'Blantyre, Malawi',
            phone: '+265 999 123 456',
            email: 'business@example.com',
            currency: 'MWK',
            taxId: '',
            enableVat: false,
            vatRate: 16.5,
            vatNumber: '',
            includeOperatingExpenses: false,
            trackPurchaseOrders: true,
            multiCurrency: false,
            fiscalYearStart: 'january'
        }

        return NextResponse.json({
            success: true,
            settings: settings || defaultSettings
        })

    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
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
        const validatedData = settingsSchema.parse(body)

        // Upsert business settings
        const settings = await prisma.businessSettings.upsert({
            where: {
                userId: session.user.id
            },
            update: validatedData,
            create: {
                ...validatedData,
                userId: session.user.id
            }
        })

        return NextResponse.json({
            success: true,
            settings
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error saving settings:', error)
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        )
    }
}
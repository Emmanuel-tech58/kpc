import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        // Check if user exists and is deleted
        const existingUser = await prisma.user.findUnique({
            where: {
                id,
                deletedAt: { not: null } // Only find deleted users
            }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found or not deleted' },
                { status: 404 }
            )
        }

        // Check if email/username conflicts with active users
        const conflictingUser = await prisma.user.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    { deletedAt: null },
                    {
                        OR: [
                            { email: existingUser.email },
                            { username: existingUser.username }
                        ]
                    }
                ]
            }
        })

        if (conflictingUser) {
            return NextResponse.json(
                { error: 'Cannot restore: email or username already exists in active users' },
                { status: 400 }
            )
        }

        // Restore user
        const user = await prisma.user.update({
            where: { id },
            data: {
                isActive: true,
                deletedAt: null,
                deletedBy: null
            },
            include: { role: true }
        })

        return NextResponse.json({
            message: 'User restored successfully',
            user: {
                ...user,
                password: undefined
            }
        })
    } catch (error) {
        console.error('Error restoring user:', error)
        return NextResponse.json(
            { error: 'Failed to restore user' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
    permissions: z.record(z.string(), z.array(z.string())).optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        })

        if (!role) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(role)
    } catch (error) {
        console.error('Error fetching role:', error)
        return NextResponse.json(
            { error: 'Failed to fetch role' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const body = await request.json()
        const validatedData = updateRoleSchema.parse(body)

        // Check if role exists
        const existingRole = await prisma.role.findUnique({
            where: { id }
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        // Check if name already exists (excluding current role)
        if (validatedData.name && validatedData.name !== existingRole.name) {
            const duplicateRole = await prisma.role.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { name: validatedData.name }
                    ]
                }
            })

            if (duplicateRole) {
                return NextResponse.json(
                    { error: 'Role name already exists' },
                    { status: 400 }
                )
            }
        }

        // Update role
        const role = await prisma.role.update({
            where: { id },
            data: {
                ...validatedData,
                permissions: validatedData.permissions as any
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        })

        return NextResponse.json(role)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error updating role:', error)
        return NextResponse.json(
            { error: 'Failed to update role' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // Check if role exists
        const existingRole = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        // Check if role has associated users
        if (existingRole._count.users > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete role with assigned users',
                    details: `This role is assigned to ${existingRole._count.users} user(s). Please reassign or remove these users before deleting the role.`
                },
                { status: 400 }
            )
        }

        // Delete role
        await prisma.role.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Role deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting role:', error)
        return NextResponse.json(
            { error: 'Failed to delete role' },
            { status: 500 }
        )
    }
}
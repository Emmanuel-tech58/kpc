import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const user = await authenticateUser(email, password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // In a real app, you'd create a JWT token here
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                permissions: user.role.permissions,
                shops: user.shops.map(us => us.shop)
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        )
    }
}
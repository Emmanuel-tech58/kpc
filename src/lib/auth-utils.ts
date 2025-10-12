import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface UserWithRole {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role: {
        name: string
        permissions: any
    }
    shops: {
        shop: {
            id: string
            name: string
        }
    }[]
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<UserWithRole | null> {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true,
            shops: {
                include: {
                    shop: true
                }
            }
        }
    })

    if (!user || !user.isActive) return null

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return null

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        shops: user.shops
    }
}

// Check if user has permission
export function hasPermission(user: UserWithRole, resource: string, action: string): boolean {
    const permissions = user.role.permissions
    return permissions[resource]?.includes(action) || false
}

// Check if user can access shop
export function canAccessShop(user: UserWithRole, shopId: string): boolean {
    return user.role.name === 'ADMIN' || user.shops.some(userShop => userShop.shop.id === shopId)
}

// Create new user
export async function createUser(userData: {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
    roleId: string
    shopIds?: string[]
}) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
        data: {
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roleId: userData.roleId
        }
    })

    // Assign user to shops if provided
    if (userData.shopIds && userData.shopIds.length > 0) {
        await prisma.userShop.createMany({
            data: userData.shopIds.map(shopId => ({
                userId: user.id,
                shopId
            }))
        })
    }

    return user
}
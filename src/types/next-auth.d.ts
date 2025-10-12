import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            username: string
            firstName: string
            lastName: string
            role: string
            permissions: any
            shops: Array<{
                id: string
                name: string
            }>
        }
    }

    interface User {
        id: string
        email: string
        name: string
        username: string
        firstName: string
        lastName: string
        role: string
        permissions: any
        shops: Array<{
            id: string
            name: string
        }>
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        firstName: string
        lastName: string
        role: string
        permissions: any
        shops: Array<{
            id: string
            name: string
        }>
    }
}
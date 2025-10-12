import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                    include: {
                        role: true,
                        shops: {
                            include: {
                                shop: true
                            }
                        }
                    }
                })

                if (!user || !user.isActive) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role.name,
                    permissions: user.role.permissions,
                    shops: user.shops.map(us => ({
                        id: us.shop.id,
                        name: us.shop.name
                    }))
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.firstName = user.firstName
                token.lastName = user.lastName
                token.role = user.role
                token.permissions = user.permissions
                token.shops = user.shops
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.username = token.username as string
                session.user.firstName = token.firstName as string
                session.user.lastName = token.lastName as string
                session.user.role = token.role as string
                session.user.permissions = token.permissions as any
                session.user.shops = token.shops as any
            }
            return session
        }
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error"
    },
    secret: process.env.NEXTAUTH_SECRET,
}
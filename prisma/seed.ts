import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create default roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Full system access',
            permissions: {
                users: ['create', 'read', 'update', 'delete'],
                shops: ['create', 'read', 'update', 'delete'],
                products: ['create', 'read', 'update', 'delete'],
                inventory: ['create', 'read', 'update', 'delete'],
                sales: ['create', 'read', 'update', 'delete'],
                purchases: ['create', 'read', 'update', 'delete'],
                reports: ['read'],
                settings: ['read', 'update']
            }
        }
    })

    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
            name: 'MANAGER',
            description: 'Shop management access',
            permissions: {
                products: ['create', 'read', 'update'],
                inventory: ['create', 'read', 'update'],
                sales: ['create', 'read', 'update'],
                purchases: ['create', 'read', 'update'],
                reports: ['read']
            }
        }
    })

    const cashierRole = await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: {
            name: 'CASHIER',
            description: 'Sales and basic inventory access',
            permissions: {
                products: ['read'],
                inventory: ['read'],
                sales: ['create', 'read'],
                customers: ['create', 'read', 'update']
            }
        }
    })

    // Create default business
    const business = await prisma.business.upsert({
        where: { id: 'default-business' },
        update: {},
        create: {
            id: 'default-business',
            name: 'KPC Business',
            description: 'Default business for KPC system',
            currency: 'USD'
        }
    })

    // Create default shop
    const shop = await prisma.shop.upsert({
        where: { id: 'default-shop' },
        update: {},
        create: {
            id: 'default-shop',
            name: 'Main Shop',
            address: '123 Main Street',
            businessId: business.id
        }
    })

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@kpc.com' },
        update: {},
        create: {
            email: 'admin@kpc.com',
            username: 'admin',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Administrator',
            roleId: adminRole.id
        }
    })

    // Assign admin to default shop
    await prisma.userShop.upsert({
        where: {
            userId_shopId: {
                userId: adminUser.id,
                shopId: shop.id
            }
        },
        update: {},
        create: {
            userId: adminUser.id,
            shopId: shop.id
        }
    })

    // Create sample manager user
    const managerPassword = await bcrypt.hash('manager123', 10)
    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@kpc.com' },
        update: {},
        create: {
            email: 'manager@kpc.com',
            username: 'manager',
            password: managerPassword,
            firstName: 'John',
            lastName: 'Manager',
            phone: '+1234567890',
            roleId: managerRole.id
        }
    })

    // Assign manager to default shop
    await prisma.userShop.upsert({
        where: {
            userId_shopId: {
                userId: managerUser.id,
                shopId: shop.id
            }
        },
        update: {},
        create: {
            userId: managerUser.id,
            shopId: shop.id
        }
    })

    // Create sample cashier user
    const cashierPassword = await bcrypt.hash('cashier123', 10)
    const cashierUser = await prisma.user.upsert({
        where: { email: 'cashier@kpc.com' },
        update: {},
        create: {
            email: 'cashier@kpc.com',
            username: 'cashier',
            password: cashierPassword,
            firstName: 'Jane',
            lastName: 'Cashier',
            phone: '+1234567891',
            roleId: cashierRole.id
        }
    })

    // Assign cashier to default shop
    await prisma.userShop.upsert({
        where: {
            userId_shopId: {
                userId: cashierUser.id,
                shopId: shop.id
            }
        },
        update: {},
        create: {
            userId: cashierUser.id,
            shopId: shop.id
        }
    })

    // Create default categories
    const electronics = await prisma.category.upsert({
        where: { id: 'electronics' },
        update: {},
        create: {
            id: 'electronics',
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            businessId: business.id
        }
    })

    const clothing = await prisma.category.upsert({
        where: { id: 'clothing' },
        update: {},
        create: {
            id: 'clothing',
            name: 'Clothing',
            description: 'Apparel and fashion items',
            businessId: business.id
        }
    })

    // Create default supplier
    const supplier = await prisma.supplier.upsert({
        where: { id: 'default-supplier' },
        update: {},
        create: {
            id: 'default-supplier',
            name: 'Default Supplier',
            contactName: 'John Doe',
            email: 'supplier@example.com',
            businessId: business.id
        }
    })

    console.log('Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
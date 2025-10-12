# KPC Inventory & Sales Management System

A comprehensive multi-shop inventory and sales management system built with Next.js, Prisma, and PostgreSQL.

## Features

### 🏪 Multi-Shop Management
- Support for multiple business locations
- Shop-specific inventory tracking
- User-shop assignments with role-based access

### 👥 User Management & Authentication
- Role-based access control (Admin, Manager, Cashier)
- Granular permissions system
- User-shop assignments

### 📦 Inventory Management
- Real-time stock tracking
- Low stock notifications
- Stock movement history
- Multi-unit support (pcs, kg, liter, etc.)
- Reserved quantity tracking

### 💰 Sales Management
- Point of sale functionality
- Multiple payment methods
- Customer management
- Sales reporting and analytics

### 📊 Purchase Management
- Supplier management
- Purchase order tracking
- Automatic inventory updates

### 📈 Analytics & Reporting
- Profit calculations
- Sales analytics
- Stock movement reports
- Low stock alerts

## Database Schema Overview

### Core Models
- **User**: System users with role-based access
- **Role**: User roles with permissions
- **Business**: Top-level business entity
- **Shop**: Individual store locations
- **Product**: Items for sale
- **Category**: Product categorization
- **Supplier**: Product suppliers

### Inventory Models
- **Inventory**: Stock levels per shop
- **StockMovement**: All stock changes with audit trail

### Sales Models
- **Sale**: Sales transactions
- **SaleItem**: Individual items in a sale
- **Customer**: Customer information

### Purchase Models
- **Purchase**: Purchase orders
- **PurchaseItem**: Items in purchase orders

## Setup Instructions

### 1. Database Setup
Make sure you have PostgreSQL running and update your `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kpc_db"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Seed Database
```bash
npm run db:seed
```

This will create:
- Default roles (ADMIN, MANAGER, CASHIER)
- Default business and shop
- Admin user (admin@kpc.com / admin123)
- Sample categories and supplier

### 6. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Inventory
- `GET /api/inventory/low-stock` - Get low stock items

### Sales
- `GET /api/sales/profit?shopId=&startDate=&endDate=` - Calculate profit

## Key Functions

### Inventory Management
```typescript
import { checkLowStock, updateInventoryAfterSale } from '@/lib/inventory-utils'

// Check for low stock items
const lowStockItems = await checkLowStock()

// Update inventory after a sale
await updateInventoryAfterSale(saleId)
```

### Profit Calculation
```typescript
import { calculateProfit } from '@/lib/inventory-utils'

// Calculate profit for a specific period
const profit = await calculateProfit(shopId, startDate, endDate)
```

### User Authentication
```typescript
import { authenticateUser, hasPermission } from '@/lib/auth-utils'

// Authenticate user
const user = await authenticateUser(email, password)

// Check permissions
const canCreateProducts = hasPermission(user, 'products', 'create')
```

## Default Permissions

### ADMIN
- Full access to all resources
- User management
- System settings

### MANAGER
- Product management
- Inventory management
- Sales and purchase management
- Reports access

### CASHIER
- Sales creation
- Customer management
- Basic inventory viewing

## Stock Movement Types
- `IN`: Stock received (purchases, returns)
- `OUT`: Stock sold
- `ADJUSTMENT`: Manual stock adjustments
- `TRANSFER`: Inter-shop transfers
- `RETURN`: Customer returns
- `DAMAGE`: Damaged goods write-off

## Notification Types
- `LOW_STOCK`: When inventory falls below minimum
- `OUT_OF_STOCK`: When inventory reaches zero
- `HIGH_STOCK`: When inventory exceeds maximum
- `SALE_COMPLETED`: Sale transaction completed
- `PURCHASE_RECEIVED`: Purchase order received
- `SYSTEM_ALERT`: System notifications

## Next Steps

1. **Frontend Development**: Create React components for inventory management, sales, and reporting
2. **Authentication**: Implement JWT tokens and session management
3. **Real-time Updates**: Add WebSocket support for live inventory updates
4. **Mobile App**: Consider React Native for mobile POS
5. **Reporting**: Build comprehensive reporting dashboards
6. **Integrations**: Add barcode scanning, receipt printing, payment gateways

## Database Commands

```bash
# View database in browser
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (careful!)
npm run db:reset
```

Your inventory management system is now ready for development! The schema supports all the features you requested including multi-shop operations, role-based access, profit calculations, and low stock notifications.
# KPC Authentication System Setup

## 🔐 Authentication Features Implemented

### Robust Authentication Pattern
- **NextAuth.js** with custom credentials provider
- **JWT-based sessions** with 24-hour expiry
- **Role-based access control** (Admin, Manager, Cashier)
- **Multi-shop user assignments**
- **Secure password hashing** with bcryptjs
- **Protected routes** with middleware
- **Session persistence** across page reloads

### UI Components (shadcn/ui)
- ✅ Modern sign-in form with validation
- ✅ User navigation dropdown with role display
- ✅ Toast notifications for feedback
- ✅ Error handling pages
- ✅ Responsive design
- ✅ Password visibility toggle
- ✅ Loading states

## 🚀 Setup Instructions

### 1. Database Setup
First, make sure your PostgreSQL database is running and update the connection string in `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kpc_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
```

### 2. Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with default data
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

## 🎯 Authentication Flow

### Sign In Process
1. User visits `/auth/signin`
2. Enters credentials (email/password)
3. NextAuth validates against database
4. Creates JWT session with user data
5. Redirects to `/dashboard`

### Session Management
- Sessions stored as HTTP-only cookies
- JWT contains user ID, role, permissions, shops
- Middleware protects routes automatically
- Session data available in components via `useSession()`

### Role-Based Access
```typescript
// Check permissions in components
const { data: session } = useSession()
const canCreateProducts = session?.user.permissions.products?.includes('create')

// Server-side protection
const session = await getServerSession(authOptions)
if (!session) redirect('/auth/signin')
```

## 🔑 Default Demo Credentials

After seeding the database:
- **Email:** admin@kpc.com
- **Password:** admin123
- **Role:** ADMIN (full access)

## 📁 File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx          # Sign-in page
│   │   ├── error/page.tsx           # Error handling
│   │   └── [...nextauth]/route.ts   # NextAuth API routes
│   ├── dashboard/
│   │   ├── layout.tsx               # Protected layout
│   │   └── page.tsx                 # Dashboard home
│   └── api/
│       └── auth/login/route.ts      # Custom login endpoint
├── components/
│   └── auth/
│       ├── signin-form.tsx          # Sign-in form component
│       ├── user-nav.tsx             # User navigation dropdown
│       └── auth-provider.tsx        # Session provider wrapper
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   ├── auth-utils.ts                # Authentication utilities
│   └── prisma.ts                    # Database client
├── types/
│   └── next-auth.d.ts               # TypeScript definitions
└── middleware.ts                    # Route protection
```

## 🛡️ Security Features

### Password Security
- Passwords hashed with bcryptjs (10 rounds)
- No plain text storage
- Secure comparison during login

### Session Security
- HTTP-only cookies prevent XSS
- Secure flag in production
- SameSite protection
- 24-hour session expiry

### Route Protection
- Middleware blocks unauthorized access
- Server-side session validation
- Automatic redirects to sign-in

### Permission System
```typescript
// Role permissions stored as JSON
{
  "products": ["create", "read", "update", "delete"],
  "sales": ["create", "read"],
  "reports": ["read"]
}
```

## 🎨 UI Components Used

- **Card, CardHeader, CardContent** - Layout containers
- **Button** - Interactive elements with loading states
- **Input, Label** - Form controls
- **Alert** - Error messages
- **Avatar, Badge** - User display
- **DropdownMenu** - Navigation menus
- **Sonner** - Toast notifications

## 🔧 Testing Without Database

If you can't connect to the database yet, you can still test the UI:

1. Comment out database calls in `src/lib/auth.ts`
2. Return mock user data for testing
3. All UI components will work perfectly

## 🚀 Next Steps

1. **Set up your PostgreSQL database**
2. **Run the database setup commands**
3. **Test the authentication flow**
4. **Customize roles and permissions**
5. **Build inventory management features**

The authentication system is production-ready with industry best practices for security, user experience, and maintainability!
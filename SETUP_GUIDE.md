# POS System - Complete Setup Guide

## Overview
This is a role-based Point of Sale system with three user levels:
- **SUPERADMIN**: Full system control, manage all accounts
- **ADMIN**: Create and manage cashiers
- **CASHIER**: Operate POS terminal

## Prerequisites
- Supabase account and project
- Node.js 18+ installed
- npm, yarn, or pnpm

## Setup Steps

### Step 1: Database Schema Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire content from `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- `users_profile` table with role management
- Row Level Security (RLS) policies for role-based access
- Automatic trigger to create profiles on signup

### Step 2: Environment Variables
Make sure your `.env.local` has these variables set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### Step 3: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 4: Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Flows

### Creating a New Account (ADMIN)
1. Go to `/auth/sign-up`
2. Enter:
   - Full Name (NEW - required field)
   - Email
   - Password
   - Confirm Password
3. Submit the form
4. The system automatically assigns the **ADMIN** role
5. User will be redirected to `/auth/sign-up-success`
6. User can then log in and access the Admin Dashboard

### Admin Managing Cashiers
1. Admin logs in and sees the Admin Dashboard
2. Navigate to "Manage Cashiers"
3. Click "Create Cashier" button
4. Fill in:
   - Cashier Full Name
   - Email
   - Password
5. Click "Create Cashier"
6. The cashier account is created with the **CASHIER** role
7. Admin can:
   - Deactivate/Activate cashiers
   - Delete cashiers
   - View cashier list

### Superadmin Managing All Accounts
1. Superadmin logs in and sees the Superadmin Dashboard
2. Navigate to "Manage Accounts"
3. Features available:
   - **Search**: Find users by name
   - **Pagination**: Set items per page (5, 10, 20, 50)
   - **Pagination Navigation**: Previous, page numbers, Next
   - **Status Management**: Activate/Deactivate users
   - **Delete Users**: Remove user accounts

### Cashier Using POS Terminal
1. Cashier logs in
2. Sees the POS Terminal dashboard with:
   - Profile information
   - System status
   - Transaction placeholder areas
3. Ready for transaction processing

## File Structure

```
app/
├── dashboard/
│   ├── superadmin/
│   │   ├── layout.tsx         # Superadmin header/nav
│   │   ├── page.tsx           # Main dashboard
│   │   └── accounts/
│   │       └── page.tsx       # Account management with pagination
│   ├── admin/
│   │   ├── layout.tsx         # Admin header/nav
│   │   ├── page.tsx           # Main dashboard
│   │   └── cashiers/
│   │       └── page.tsx       # Cashier management
│   └── cashier/
│       ├── layout.tsx         # Cashier header/nav
│       └── page.tsx           # POS terminal
├── auth/
│   ├── sign-up/
│   │   └── page.tsx           # Updated with fullname
│   ├── login/
│   ├── forgot-password/
│   └── ...
└── protected/
    ├── layout.tsx             # Updated with role-based redirect
    └── page.tsx

components/
├── sign-up-form.tsx           # Updated with fullname field
├── ui/
│   └── pagination.tsx         # NEW - Pagination component
└── ...

lib/
├── auth-utils.ts              # NEW - Role checking utilities
└── ...

middleware.ts                   # NEW - Role-based routing
supabase/
└── schema.sql                  # NEW - Database schema

```

## Key Features

### 1. Signup Form with Fullname
- Requires fullname input
- Auto-assigns ADMIN role to new signups
- Stores fullname in user metadata and profile

### 2. Role-Based Access Control
- Middleware automatically redirects users to their dashboard
- SUPERADMIN → /dashboard/superadmin
- ADMIN → /dashboard/admin
- CASHIER → /dashboard/cashier
- RLS policies ensure users can only access their data

### 3. Superadmin Account Management
- Search by name
- Configurable pagination (5, 10, 20, 50 items per page)
- Pagination format: `Previous 1 2 3 4 5 ... Next`
- Activate/Deactivate users
- Delete users
- View all user details

### 4. Admin Cashier Management
- Create new cashiers with email/password
- View all cashiers created by this admin
- Activate/Deactivate cashiers
- Delete cashiers

### 5. Pagination Component
- Displays page numbers with ellipsis for large ranges
- Previous/Next buttons
- Current page highlighting
- Disable buttons at boundaries
- Sibling count configurable (default: 2)

## Database Schema Details

### users_profile Table
```sql
- id (UUID) - Primary key, references auth.users
- fullname (VARCHAR) - User's full name
- role (user_role) - SUPERADMIN, ADMIN, or CASHIER
- created_by (UUID) - Admin who created this user
- created_at (TIMESTAMP) - Account creation date
- updated_at (TIMESTAMP) - Last update
- is_active (BOOLEAN) - Account status
```

### RLS Policies
- **Superadmin**: Can view and modify all users
- **Admin**: Can create and modify their own cashiers
- **Cashier**: Can only view their own profile

## API Endpoints (via Supabase)

All database operations go through Supabase client:
- `POST /auth/v1/signup` - Create new account
- `POST /auth/v1/token?grant_type=password` - Login
- `GET /rest/v1/users_profile` - Fetch user data
- `PATCH /rest/v1/users_profile` - Update user data
- `DELETE /rest/v1/users_profile` - Delete user

## Customization Guide

### Changing Pagination Items Per Page
Edit `/app/dashboard/superadmin/accounts/page.tsx`:
```typescript
const ITEMS_PER_PAGE = 10; // Change this value
```

### Adding New User Roles
1. Update the enum in `supabase/schema.sql`:
```sql
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'CASHIER', 'NEW_ROLE');
```
2. Add RLS policies for the new role
3. Update the middleware in `middleware.ts`
4. Create new dashboard pages

### Customizing Dashboard Layouts
- Admin layout: `/app/dashboard/admin/layout.tsx`
- Superadmin layout: `/app/dashboard/superadmin/layout.tsx`
- Cashier layout: `/app/dashboard/cashier/layout.tsx`

## Troubleshooting

### Issue: Users can't see their data
**Solution**: Make sure RLS policies are enabled and the schema.sql was executed completely.

### Issue: Signup form is missing fullname
**Solution**: Check that `sign-up-form.tsx` has been updated and includes the fullname field.

### Issue: Role-based redirect not working
**Solution**: Verify middleware.ts is in the root directory and check the console for errors.

### Issue: Pagination not displaying correctly
**Solution**: Ensure `Pagination` component is imported from `@/components/ui/pagination`

### Issue: Users can see other users' data
**Solution**: Check that RLS policies in the database are properly configured and that the user's role is correctly set in the database.

## Security Considerations

1. **RLS Enabled**: All database queries are protected by Row Level Security policies
2. **Role-Based Access**: Routes are protected by middleware
3. **Password Hashing**: Supabase handles password hashing securely
4. **Session Management**: Supabase handles session cookies automatically

## Next Steps

1. **Add More Features**:
   - Product inventory management
   - Transaction history
   - Sales reports
   - Receipt generation

2. **Enhance Cashier Dashboard**:
   - Add POS transaction interface
   - Integrate payment processing
   - Add product search and cart

3. **Analytics**:
   - Sales dashboards
   - User activity logs
   - Revenue reports

## Support

For issues or questions:
1. Check Supabase documentation
2. Review the schema in `supabase/schema.sql`
3. Check middleware configurations
4. Review RLS policies in Supabase dashboard

---

**Last Updated**: 2024
**Version**: 1.0

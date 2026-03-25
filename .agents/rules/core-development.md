---
trigger: always_on
---

# Workspace Rules: Baisard Core

## Role-Based Access Control (RBAC)
This project operates on a three-tier permission system. All logic must verify the user role before execution.

* **Superadmin**: Access to global settings, branch management, and system-wide audits.
* **Manager**: Access to specific branch inventory, staff management, and sales reports.
* **Cashier**: Access to the point-of-sale terminal and daily shift reports only.

---

## 1. Technical Stack & Architecture
* **Framework**: Next.js (App Router).
* **Database & Auth**: Supabase.
* **ORM**: Prisma.
* **Styling**: Tailwind CSS and shadcn/ui.

---

## 2. Database & Prisma Rules
* **Schema Integrity**: Define all roles in a Prisma `enum`. 
* **Atomic Transactions**: Use `prisma.$transaction` for sales. This ensures stock decreases only if the payment record succeeds.
* **Relational Mapping**: Every transaction must link to a `Profile` (the user) and a `Branch`.
* **Syncing**: Run `npx prisma generate` immediately after schema changes to maintain type safety.

---

## 3. Security & Role Logic
* **Server-Side Validation**: Never rely on client-side role checks for data mutation. Validate the user role inside Server Actions or API Routes.
* **Row Level Security**: Ensure Prisma queries filter by `branchId` for Managers and Cashiers to prevent data leakage between branches.
* **Middleware**: Redirect users to their specific dashboard (e.g., `/pos` for Cashiers, `/admin` for Superadmins) upon login.

---

## 4. UI & Component Standards
* **shadcn/ui**: Use the standard component library. Do not create custom buttons or inputs unless the library lacks them.
* **Role Guards**: Wrap sensitive UI elements in a guard component.
    * *Example*: `if (role === 'SUPERADMIN') { showDeleteButton() }`.
* **Feedback**: Use sonner or shadcn toast for transaction success or permission errors.

---

## 5. Coding Style & Documentation
* **Comments**: Document the "why" of complex business logic. **All comments must be written in Spanish.**
* **Naming**: Use clear, descriptive names for functions (e.g., `processRetailSale` instead of `handleSale`).
* **Clean Code**: Avoid semicolons. Use active voice in any generated text. Avoid em dashes.

---

## 6. Implementation Reference

### Role Schema
```prisma
enum UserRole {
  SUPERADMIN
  MANAGER
  CASHIER
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  role      UserRole @default(CASHIER)
  branchId  String?
  sales     Sale[]   // Relación con ventas realizadas
}
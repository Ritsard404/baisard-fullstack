import { z } from "zod";

// Supabase Auth and Prisma enums use these exact roles
export const UserRoleEnum = z.enum(["SUPERADMIN", "ADMIN", "CASHIER"]);

export const createUserSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  role: UserRoleEnum.default("CASHIER"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long").optional(),
  role: UserRoleEnum.optional(),
  isActive: z.boolean().optional(),
});

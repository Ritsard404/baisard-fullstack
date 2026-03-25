import { z } from "zod";
import { createUserSchema, updateUserSchema, UserRoleEnum } from "../schemas/user.schema";
// We also import Prisma types once it's available, but define our DTOs here
// If Prisma is installed, we can import { User, UserRole } from "@prisma/client"

export type UserRole = z.infer<typeof UserRoleEnum>;

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// Representation of the User without sensitive data
export interface UserDTO {
  id: string; // mapping to Supabase UUID
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Note: users_profile doesn't store email, as Supabase Auth manages it.
  // When retrieving users via Admin API we can merge the email if necessary.
  email?: string; 
}

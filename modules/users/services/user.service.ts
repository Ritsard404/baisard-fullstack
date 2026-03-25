import { createClient } from "@supabase/supabase-js";
import { userRepository } from "../repository/user.repository";
import { CreateUserDTO, UpdateUserDTO, UserDTO } from "../types/user.types";

// Helper to get Supabase Admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export class UserService {
  async getAllUsers(callerRole: string): Promise<UserDTO[]> {
    if (callerRole !== "SUPERADMIN" && callerRole !== "ADMIN") {
      throw new Error("Unauthorized to view users");
    }
    return userRepository.findAll() as any; // Cast as generic DTO
  }

  async createUser(data: CreateUserDTO, callerRole: string, callerId: string): Promise<UserDTO> {
    if (callerRole !== "SUPERADMIN") {
      throw new Error("Only SUPERADMIN can create users");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        fullname: data.fullName,
        role: data.role,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create user in Auth: ${authError?.message}`);
    }

    // 2. Crear el registro en Prisma (usando el ID de Supabase)
    try {
      const newUser = await userRepository.create(authData.user.id, data, callerId);
      return newUser as any;
    } catch (dbError) {
      // Rollback Auth creation in case of DB failure to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error("Failed to save user in database. Auth creation reversed.");
    }
  }

  async updateUser(id: string, data: UpdateUserDTO, callerRole: string, callerId: string): Promise<UserDTO> {
    // Basic RBAC
    if (callerRole === "CASHIER") {
      throw new Error("Unauthorized to update users");
    }
    
    // Note: To fully match Baisard core RBAC, an ADMIN can only update their own cashiers.
    // We would need to fetch the existing user to check `createdBy === callerId`.
    if (callerRole === "ADMIN") {
      const existingUser = await userRepository.findById(id);
      if (!existingUser || (existingUser as any).createdBy !== callerId) {
         throw new Error("Unauthorized: Admin can only update users they created.");
      }
      // Admins cannot elevate roles
      if (data.role && data.role === "SUPERADMIN") {
        throw new Error("Unauthorized: Admin cannot promote to Superadmin.");
      }
    }

    // 1. Update in Supabase Auth if needed
    // (If name or role changes, we could update user_metadata)
    const supabaseAdmin = getSupabaseAdmin();
    const metadataUpdates: any = {};
    if (data.fullName) metadataUpdates.fullname = data.fullName;
    if (data.role) metadataUpdates.role = data.role;
    
    if (Object.keys(metadataUpdates).length > 0) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: metadataUpdates,
      });
    }

    // 2. Update in Prisma
    const updatedUser = await userRepository.update(id, data);
    return updatedUser as any;
  }

  async deleteUser(id: string, callerRole: string): Promise<void> {
    if (callerRole !== "SUPERADMIN") {
      throw new Error("Only SUPERADMIN can delete users");
    }

    // Soft delete in DB
    await userRepository.softDelete(id);

    // Optionally ban/disable in Supabase Auth to prevent login
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: "876000h", // effectively banned forever
    });
  }
}

export const userService = new UserService();

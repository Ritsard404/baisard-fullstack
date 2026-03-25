import { PrismaClient } from "@prisma/client";
import { CreateUserDTO, UpdateUserDTO, UserDTO } from "../types/user.types";

const prisma = new PrismaClient();

// Capa de repositorio: Solo maneja consultas a Prisma, sin lógica de negocio
export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    // Nota: depends on whether email is stored in users_profile. 
    // Supabase auth stores it, but if we need a quick lookup we might need to query auth.users if possible
    // For now, we rely on Supabase Admin API for email lookups if needed.
    return null; 
  }

  async create(id: string, data: CreateUserDTO, createdBy?: string) {
    return prisma.user.create({
      data: {
        id, // Este ID debe coincidir con el ID generado por Supabase Auth
        fullName: data.fullName,
        role: data.role,
        createdBy,
      },
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        role: data.role,
        isActive: data.isActive,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const userRepository = new UserRepository();

"use client";

import { useState } from "react";
import { UserDTO } from "../types/user.types";
import { useUsers } from "../hooks/useUsers";

interface UserFormProps {
  user: UserDTO | null;
  onClose: () => void;
}

export function UserForm({ user, onClose }: UserFormProps) {
  const { createUser, updateUser, loading } = useUsers();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;

  // Generic controlled form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "CASHIER",
    password: "",
    isActive: user?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let success = false;
    if (isEditing) {
      if (!user) return;
      success = await updateUser(user.id, {
        fullName: formData.fullName,
        role: formData.role as any,
        isActive: formData.isActive,
      });
    } else {
      success = await createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role as any,
      });
    }

    if (success) {
      onClose();
    } else {
      setError("Ocurrió un error al guardar el usuario. Revisa los datos o tus permisos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

      <div className="space-y-1">
        <label className="text-sm font-medium">Nombre Completo</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      {!isEditing && (
        <>
          <div className="space-y-1">
            <label className="text-sm font-medium">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contraseña Temporal</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Rol</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md bg-background"
        >
          <option value="CASHIER">Cajero (CASHIER)</option>
          <option value="ADMIN">Administrador (ADMIN/MANAGER)</option>
          <option value="SUPERADMIN">Super Admin</option>
        </select>
      </div>

      {isEditing && (
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <label htmlFor="isActive" className="text-sm">Usuario Activo</label>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-muted"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

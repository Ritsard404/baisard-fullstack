import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export type UserRole = "SUPERADMIN" | "ADMIN" | "CASHIER";

export interface UserProfile {
  id: string;
  fullname: string;
  role: UserRole;
  created_by: string | null;
  created_at: string;
  is_active: boolean;
}

// Server-side role check
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createServerClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return null;

    const { data, error } = await supabase
      .from("users_profile")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (error) return null;
    return data?.role as UserRole;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Server-side user profile fetch
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return null;

    const { data, error } = await supabase
      .from("users_profile")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (error) return null;
    return data as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// Client-side role check
export async function getClientUserRole(): Promise<UserRole | null> {
  try {
    const supabase = createBrowserClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return null;

    const { data, error } = await supabase
      .from("users_profile")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (error) return null;
    return data?.role as UserRole;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Check if user is superadmin
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "SUPERADMIN";
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN";
}

// Check if user is cashier
export async function isCashier(): Promise<boolean> {
  const role = await getUserRole();
  return role === "CASHIER";
}

import { UserList } from "@/modules/users/components/UserList";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Double check authorization on the server component
  const { data: profile } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "SUPERADMIN" && profile?.role !== "ADMIN") {
    redirect("/dashboard/cashier");
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los roles y accesos del sistema.</p>
        </div>
        <UserList />
      </div>
    </div>
  );
}

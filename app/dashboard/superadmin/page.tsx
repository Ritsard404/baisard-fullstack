import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SuperAdminDashboard() {
  const supabase = await createClient();

  // Get counts for each role
  const { data: superAdmins } = await supabase
    .from("users_profile")
    .select("id", { count: "exact" })
    .eq("role", "SUPERADMIN");

  const { data: admins } = await supabase
    .from("users_profile")
    .select("id", { count: "exact" })
    .eq("role", "ADMIN");

  const { data: cashiers } = await supabase
    .from("users_profile")
    .select("id", { count: "exact" })
    .eq("role", "CASHIER");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Superadmin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage all accounts and system operations
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Superadmins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {superAdmins?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Store managers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashiers?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Point of sale operators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Accounts</p>
              <p className="text-2xl font-bold mt-1">
                {(superAdmins?.length || 0) +
                  (admins?.length || 0) +
                  (cashiers?.length || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold mt-1">
                {(superAdmins?.length || 0) +
                  (admins?.length || 0) +
                  (cashiers?.length || 0)}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              As a superadmin, you have full control over all accounts and can
              manage users across all roles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

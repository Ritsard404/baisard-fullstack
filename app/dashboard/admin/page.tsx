import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return <div>Loading...</div>;
  }

  // Get cashier count for this admin
  const { data: cashiers, count: cashierCount } = await supabase
    .from("users_profile")
    .select("id", { count: "exact" })
    .eq("role", "CASHIER")
    .eq("created_by", authData.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your cashiers and monitor store operations
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Your Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashierCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total cashiers under your management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashierCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active cashiers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Your Role</p>
              <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                ADMIN
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              As an admin, you can create and manage cashier accounts. Cashiers
              will be able to process transactions at the POS terminals.
            </p>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Quick Actions</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Create new cashier accounts</li>
              <li>• View and manage cashier details</li>
              <li>• Activate or deactivate cashiers</li>
              <li>• Monitor store operations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CashierDashboard() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">POS Terminal</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Point of Sale system
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Full Name
              </p>
              <p className="text-lg font-semibold mt-1">{profile.fullname}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {profile.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold mt-1">
                {profile.is_active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Member Since
              </p>
              <p className="text-lg font-semibold mt-1">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Today's Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total sales today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* POS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are logged in as a cashier. Use this terminal to process
            customer transactions. Your account is managed by your store
            administrator.
          </p>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Available Features:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Process sales transactions</li>
              <li>• View transaction history</li>
              <li>• Generate receipts</li>
              <li>• View daily summary</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

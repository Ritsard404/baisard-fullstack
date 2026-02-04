"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserProfile } from "@/lib/auth-utils";
import { Loader2, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  // Get current admin ID
  const getAdminId = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      setCurrentAdminId(authData.user.id);
    }
  }, [supabase]);

  // Fetch cashiers for this admin
  const fetchCashiers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First get the admin ID
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not authenticated");

      const { data, error: supabaseError } = await supabase
        .from("users_profile")
        .select("*")
        .eq("role", "CASHIER")
        .eq("created_by", authData.user.id)
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;
      setCashiers(data || []);
      setCurrentAdminId(authData.user.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch cashiers"
      );
      console.error("Error fetching cashiers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCashiers();
    getAdminId();
  }, [fetchCashiers, getAdminId]);

  // Create new cashier
  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullname.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Sign up the cashier
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullname: formData.fullname,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Update the profile with CASHIER role and created_by
      const { error: updateError } = await supabase
        .from("users_profile")
        .update({
          role: "CASHIER",
          created_by: currentAdminId,
        })
        .eq("id", authData.user.id);

      if (updateError) throw updateError;

      setSuccessMessage("Cashier created successfully!");
      setFormData({ fullname: "", email: "", password: "" });
      setShowCreateForm(false);
      
      // Refresh cashiers list
      setTimeout(() => {
        fetchCashiers();
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create cashier");
      console.error("Error creating cashier:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete cashier
  const handleDeleteCashier = async (cashierId: string) => {
    if (!confirm("Are you sure you want to delete this cashier?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("users_profile")
        .delete()
        .eq("id", cashierId);

      if (error) throw error;

      setCashiers(cashiers.filter((c) => c.id !== cashierId));
      setSuccessMessage("Cashier deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete cashier");
      console.error("Error deleting cashier:", err);
    }
  };

  // Toggle cashier active status
  const handleToggleActive = async (
    cashierId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("users_profile")
        .update({ is_active: !currentStatus })
        .eq("id", cashierId);

      if (error) throw error;

      setCashiers(
        cashiers.map((c) =>
          c.id === cashierId ? { ...c, is_active: !currentStatus } : c
        )
      );
      setSuccessMessage("Cashier status updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update cashier"
      );
      console.error("Error updating cashier:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cashier Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your store cashiers
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Cashier
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Create Cashier Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Cashier</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCashier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Cashier"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cashiers List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Cashiers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cashiers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No cashiers created yet.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create First Cashier
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cashiers.map((cashier) => (
                    <tr
                      key={cashier.id}
                      className="border-b hover:bg-muted/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{cashier.fullname}</p>
                          <p className="text-xs text-muted-foreground">
                            {cashier.id.substring(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {cashier.is_active ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(cashier.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleActive(
                                cashier.id,
                                cashier.is_active
                              )
                            }
                          >
                            {cashier.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCashier(cashier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { UserProfile } from "@/lib/auth-utils";
import { Loader2, Trash2, CheckCircle, XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AccountsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageLocal, setItemsPerPageLocal] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("users_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, users]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPageLocal);
  const startIndex = (currentPage - 1) * itemsPerPageLocal;
  const endIndex = startIndex + itemsPerPageLocal;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("users_profile")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
      console.error("Error deleting user:", err);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users_profile")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
      console.error("Error updating user:", err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CASHIER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all user accounts in the system
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Search by Name
              </label>
              <Input
                placeholder="Enter fullname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Items per page
              </label>
              <select
                value={itemsPerPageLocal}
                onChange={(e) => {
                  setItemsPerPageLocal(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value={5}>5 items</option>
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
                <option value={50}>50 items</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredUsers.length)} of{" "}
            {filteredUsers.length} results
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No users found matching your search."
                  : "No users found."}
              </p>
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
                      Role
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
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-muted/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{user.fullname}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.is_active ? (
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
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleActive(user.id, user.is_active)
                            }
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

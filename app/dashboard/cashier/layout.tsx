import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("role, fullname")
    .eq("id", authData.user.id)
    .single();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-b-foreground/10">
        <nav className="w-full flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/cashier" className="font-bold text-lg">
              POS Terminal
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/cashier">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {profile?.fullname}</span>
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</div>

      {/* Footer */}
      <footer className="border-t border-t-foreground/10 p-4 text-center text-xs text-muted-foreground">
        <p>POS System &copy; 2024</p>
      </footer>
    </main>
  );
}

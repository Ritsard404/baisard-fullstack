import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Handle cookie setting in middleware
          }
        },
      },
    },
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  // Get user role from database
  const { data: profile } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role as string;

  // Role-based route protection
  if (pathname.startsWith("/dashboard/superadmin")) {
    if (userRole !== "SUPERADMIN") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname =
        userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/cashier";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard/cashier";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (pathname.startsWith("/dashboard/cashier")) {
    if (userRole !== "CASHIER" && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Generic dashboard redirect based on role
  if (pathname === "/dashboard" || pathname === "/protected") {
    let redirectPath = "/dashboard/cashier";
    if (userRole === "ADMIN") redirectPath = "/dashboard/admin";
    if (userRole === "SUPERADMIN") redirectPath = "/dashboard/superadmin";

    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = redirectPath;
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  title: "Therapist login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold tracking-tight">Ephatha</p>
          <p className="mt-1 text-xs text-muted-foreground">Private therapist workspace</p>
        </div>
        <AdminLoginForm configured={await isAdminAuthConfigured()} />
      </div>
    </main>
  );
}

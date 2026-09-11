import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold tracking-tight">Grace Sessions</p>
          <p className="mt-1 text-xs text-muted-foreground">Private therapist workspace</p>
        </div>
        <AdminLoginForm configured={isAdminAuthConfigured()} />
      </div>
    </main>
  );
}

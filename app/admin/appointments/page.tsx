import { AdminShell } from "@/components/admin/layout/admin-shell";
import { PageContainer } from "@/components/ui/page-container";
import { AdminAppointmentsManager } from "@/components/admin/appointments/admin-appointments-manager";
import { isGoogleCalendarSetupUnlocked } from "@/lib/admin/setup-auth";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const setupUnlocked = await isGoogleCalendarSetupUnlocked();

  return (
    <AdminShell>
      <PageContainer className="space-y-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Scheduling</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Appointments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review upcoming and past appointments, update their operational status, and manage patient scheduling links.
          </p>
        </div>

        {!setupUnlocked && (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
            Admin appointment management is protected by the temporary setup access gate. Production admin authentication is part of the security hardening phase.
          </div>
        )}

        {setupUnlocked ? <AdminAppointmentsManager /> : <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Unlock the admin workspace to manage appointments.</div>}
      </PageContainer>
    </AdminShell>
  );
}

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { PageContainer } from "@/components/ui/page-container";
import { AdminAppointmentsManager } from "@/components/admin/appointments/admin-appointments-manager";

export const dynamic = "force-dynamic";

export default function AdminAppointmentsPage() {
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

        <AdminAppointmentsManager />
      </PageContainer>
    </AdminShell>
  );
}

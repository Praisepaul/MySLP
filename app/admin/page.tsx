import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";
import { AdminShell } from "@/components/admin/layout/admin-shell";
import { PageContainer } from "@/components/ui/page-container";

export default function AdminPage() {
  return (
    <AdminShell>
      <PageContainer>
        <AdminDashboard />
      </PageContainer>
    </AdminShell>
  );
}

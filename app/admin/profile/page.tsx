import { AdminShell } from "@/components/admin/layout/admin-shell";
import { ProfileForm } from "@/components/admin/profile/profile-form";
import { PageContainer } from "@/components/ui/page-container";

export default function AdminProfilePage() {
  return <AdminShell><PageContainer className="space-y-8">
    <div><p className="text-sm font-medium text-muted-foreground">Content</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Therapist profile</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Update the information patients see on your public website. You can make these changes yourself without editing any code.</p></div>
    <ProfileForm />
  </PageContainer></AdminShell>;
}

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { AvailabilityManager } from "@/components/admin/availability/availability-manager";
import { PageContainer } from "@/components/ui/page-container";
import { getAvailabilityConfiguration } from "@/lib/cms/availability-repository";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const availability = await getAvailabilityConfiguration();
  return <AdminShell><PageContainer className="space-y-10"><div><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Availability</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Set your regular working hours and add exceptions for dates that need different availability.</p></div><AvailabilityManager initialRules={availability.rules} initialExceptions={availability.exceptions}/></PageContainer></AdminShell>;
}

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { BookingSettingsForm } from "@/components/admin/booking-settings/booking-settings-form";
import { PageContainer } from "@/components/ui/page-container";

export default function AdminBookingSettingsPage() {
  return <AdminShell><PageContainer className="space-y-8">
    <div><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Booking settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Control when patients can book and the information they see around cancellations and rescheduling.</p></div>
    <BookingSettingsForm />
  </PageContainer></AdminShell>;
}

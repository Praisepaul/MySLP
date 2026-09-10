import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";
import { AppointmentManagement } from "@/components/public/appointments/appointment-management";
import { findAppointmentByToken, toAppointmentPublicView } from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AppointmentPageProps {
  params: Promise<{ confirmationToken: string }>;
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { confirmationToken } = await params;
  if (!confirmationToken || confirmationToken.length > 100) notFound();

  const appointment = await findAppointmentByToken(confirmationToken);
  if (!appointment) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <AppointmentManagement initialAppointment={toAppointmentPublicView(appointment)} />
      </main>
      <PublicFooter />
    </div>
  );
}

import { notFound } from "next/navigation";
import { AppointmentReschedule } from "@/components/public/appointments/appointment-reschedule";
import { findAppointmentByToken } from "@/lib/appointments/appointment-repository";
import { getServices } from "@/lib/cms/services-repository";

type PageProps = { params: Promise<{ confirmationToken: string }> };

export const dynamic = "force-dynamic";

export default async function AppointmentReschedulePage({ params }: PageProps) {
  const { confirmationToken } = await params;
  const appointment = await findAppointmentByToken(confirmationToken);
  if (!appointment || appointment.status !== "confirmed") notFound();
  const service = (await getServices()).find((item) => item.id === appointment.service.id && item.active);
  if (!service) notFound();
  return <AppointmentReschedule appointment={{ confirmationToken: appointment.confirmationToken, status: appointment.status, service: appointment.service, patientName: appointment.patient.name, patientEmail: appointment.patient.email, startAt: appointment.startAt.toISOString(), endAt: appointment.endAt.toISOString(), timezone: appointment.timezone, createdAt: appointment.createdAt.toISOString(), ...(appointment.googleMeet ? { googleMeet: appointment.googleMeet } : {}) }} service={service} />;
}

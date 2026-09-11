import { NextResponse } from "next/server";
import { AppointmentBookingError, rescheduleAppointment } from "@/lib/appointments/appointment-service";
import { cancelAppointment, findAppointmentByToken, toAppointmentPublicView } from "@/lib/appointments/appointment-repository";
import { getBookingSettings } from "@/lib/cms/site-settings-repository";
import { deleteGoogleCalendarAppointmentEvent } from "@/lib/calendar/google-calendar-event-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ confirmationToken: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  if (!confirmationToken || confirmationToken.length > 100) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  const appointment = await findAppointmentByToken(confirmationToken);
  if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  try {
    const body = await request.json();
    const appointment = await rescheduleAppointment({ confirmationToken, startAt: body.startAt, timezone: body.timezone, enforcePatientPolicy: true });
    return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
  } catch (error) {
    const status = error instanceof AppointmentBookingError ? (error.code === "INVALID_REQUEST" ? 400 : error.code === "UNAVAILABLE" ? 409 : 500) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "We couldn't reschedule the appointment. Please try again." }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  if (!confirmationToken || confirmationToken.length > 100) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const appointment = await findAppointmentByToken(confirmationToken);
  if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  const settings = await getBookingSettings();
  const remainingMinutes = (appointment.startAt.getTime() - Date.now()) / 60000;
  if (!settings.cancellationAllowed) return NextResponse.json({ error: "Online cancellation is currently unavailable. Please contact the therapist." }, { status: 409 });
  if (appointment.status !== "confirmed" || appointment.startAt.getTime() <= Date.now()) return NextResponse.json({ error: "This appointment can no longer be cancelled online." }, { status: 409 });
  if (remainingMinutes < settings.cancellationDeadlineMinutes) return NextResponse.json({ error: "This appointment is too close to its start time to be cancelled online." }, { status: 409 });

  const cancelled = await cancelAppointment(confirmationToken);
  if (!cancelled) return NextResponse.json({ error: "This appointment changed before it could be cancelled. Please try again." }, { status: 409 });

  const eventId = cancelled.googleCalendar?.eventId;
  if (eventId) {
    try {
      await deleteGoogleCalendarAppointmentEvent(eventId);
    } catch {
      // MongoDB cancellation remains authoritative; calendar reconciliation can retry the deletion.
    }
  }

  return NextResponse.json({ appointment: toAppointmentPublicView(cancelled) });
}

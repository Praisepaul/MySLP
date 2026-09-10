import { NextResponse } from "next/server";
import { cancelAppointment, findAppointmentByToken, rescheduleAppointment, AppointmentBookingError } from "@/lib/appointments/appointment-service";
import { toAppointmentPublicView } from "@/lib/appointments/appointment-repository";
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
    const appointment = await rescheduleAppointment({ confirmationToken, startAt: body.startAt });
    return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
  } catch (error) {
    const status = error instanceof AppointmentBookingError ? (error.code === "INVALID_REQUEST" ? 400 : error.code === "UNAVAILABLE" ? 409 : 500) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "We couldn't reschedule the appointment. Please try again." }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  if (!confirmationToken || confirmationToken.length > 100) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const appointment = await cancelAppointment(confirmationToken);
  if (!appointment) {
    const existing = await findAppointmentByToken(confirmationToken);
    if (!existing) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    return NextResponse.json({ error: "This appointment can no longer be cancelled online." }, { status: 409 });
  }

  const eventId = appointment.googleCalendar?.eventId;
  if (eventId) {
    try {
      await deleteGoogleCalendarAppointmentEvent(eventId);
    } catch {
      // MongoDB cancellation remains authoritative; calendar reconciliation can retry the deletion.
    }
  }

  return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
}

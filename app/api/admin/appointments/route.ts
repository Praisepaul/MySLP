import { NextResponse } from "next/server";
import { appointmentStatuses, type AppointmentStatus } from "@/lib/appointments/appointment-types";
import { AppointmentBookingError, rescheduleAppointment } from "@/lib/appointments/appointment-service";
import { cancelAppointment, findAdminAppointments, toAppointmentPublicView, updateAppointmentStatus, updateGoogleCalendarSyncStatus } from "@/lib/appointments/appointment-repository";
import { deleteGoogleCalendarAppointmentEvent } from "@/lib/calendar/google-calendar-event-service";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(appointment: Awaited<ReturnType<typeof findAdminAppointments>>[number]) {
  return {
    ...toAppointmentPublicView(appointment),
    id: appointment._id?.toHexString(),
    idempotencyKey: appointment.idempotencyKey,
    googleCalendar: appointment.googleCalendar,
  };
}

export async function GET(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const url = new URL(request.url);
    const rawStatus = url.searchParams.get("status") ?? undefined;
    const status = rawStatus && appointmentStatuses.includes(rawStatus as AppointmentStatus) ? rawStatus as AppointmentStatus : undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const fromRaw = url.searchParams.get("from");
    const toRaw = url.searchParams.get("to");
    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;
    if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    const appointments = await findAdminAppointments({ status, search, from, to });
    return NextResponse.json({ appointments: appointments.map(serialize) });
  } catch (error) {
    const status = error instanceof Error && error.message === "Google Calendar setup access is required." ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? "Admin access is required." : "We couldn't load appointments." }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const body = await request.json() as { confirmationToken?: unknown; action?: unknown; startAt?: unknown; timezone?: unknown };
    if (typeof body.confirmationToken !== "string" || body.confirmationToken.length > 100) return NextResponse.json({ error: "Invalid appointment." }, { status: 400 });

    if (body.action === "reschedule") {
      const appointment = await rescheduleAppointment({ confirmationToken: body.confirmationToken, startAt: body.startAt, timezone: body.timezone });
      return NextResponse.json({ appointment: serialize(appointment) });
    }

    if (body.action === "completed" || body.action === "no_show") {
      const appointment = await updateAppointmentStatus({ confirmationToken: body.confirmationToken, status: body.action });
      if (!appointment) return NextResponse.json({ error: "Only confirmed appointments can be marked this way." }, { status: 409 });
      return NextResponse.json({ appointment: serialize(appointment) });
    }

    return NextResponse.json({ error: "Unsupported appointment action." }, { status: 400 });
  } catch (error) {
    const status = error instanceof AppointmentBookingError ? (error.code === "INVALID_REQUEST" ? 400 : error.code === "UNAVAILABLE" ? 409 : 500) : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "We couldn't update the appointment." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const body = await request.json() as { confirmationToken?: unknown };
    if (typeof body.confirmationToken !== "string" || body.confirmationToken.length > 100) return NextResponse.json({ error: "Invalid appointment." }, { status: 400 });
    const appointment = await cancelAppointment(body.confirmationToken);
    if (!appointment) return NextResponse.json({ error: "This appointment can no longer be cancelled." }, { status: 409 });
    const eventId = appointment.googleCalendar?.eventId;
    if (eventId) {
      try {
        await deleteGoogleCalendarAppointmentEvent(eventId);
        await updateGoogleCalendarSyncStatus({ confirmationToken: appointment.confirmationToken, syncStatus: "not_connected" });
      } catch (error) {
        await updateGoogleCalendarSyncStatus({ confirmationToken: appointment.confirmationToken, syncStatus: "failed", error: error instanceof Error ? error.message.slice(0, 500) : "Google Calendar event deletion failed." });
      }
    }
    return NextResponse.json({ appointment: serialize(appointment) });
  } catch (error) {
    const status = error instanceof Error && error.message === "Google Calendar setup access is required." ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? "Admin access is required." : "We couldn't cancel the appointment." }, { status });
  }
}

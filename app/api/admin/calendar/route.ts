import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { findAdminAppointments } from "@/lib/appointments/appointment-repository";
import { getGoogleCalendarEvents, getCachedGoogleCalendarBusyIntervals } from "@/lib/calendar/google-calendar-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return NextResponse.json({ error: "Invalid calendar range." }, { status: 400 });

    const [appointments, googleEvents, busyIntervals] = await Promise.all([
      findAdminAppointments({ from: start, to: end, limit: 500 }),
      getGoogleCalendarEvents(start, end),
      getCachedGoogleCalendarBusyIntervals(start, end),
    ]);

    return NextResponse.json({
      appointments: appointments.map((appointment) => ({ id: appointment.confirmationToken, title: appointment.service.name, patientName: appointment.patient.name, status: appointment.status, start: appointment.startAt.toISOString(), end: appointment.endAt.toISOString(), timezone: appointment.timezone, meetUrl: appointment.googleMeet?.joinUrl })),
      googleEvents: googleEvents?.map((event) => ({ ...event, start: event.start.toISOString(), end: event.end.toISOString() })) ?? [],
      connected: googleEvents !== null,
      busyIntervals: busyIntervals?.map((interval) => ({ start: interval.start.toISOString(), end: interval.end.toISOString() })) ?? [],
    });
  } catch (error) {
    console.error("Admin calendar load failed", error);
    return NextResponse.json({ error: "Calendar could not be loaded." }, { status: 500 });
  }
}

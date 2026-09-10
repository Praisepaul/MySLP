import { NextResponse } from "next/server";
import {
  findAppointmentByToken,
  toAppointmentPublicView,
} from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDate(value: string): string {
  return value.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildIcs(appointment: ReturnType<typeof toAppointmentPublicView>): string {
  const title = `Grace Sessions — ${appointment.service.name}`;
  const description = `Appointment with Grace Sessions. Service: ${appointment.service.name}.`;
  const now = new Date().toISOString();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grace Sessions//Appointment Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.confirmationToken}@grace-sessions`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(appointment.startAt)}`,
    `DTEND:${formatIcsDate(appointment.endAt)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ confirmationToken: string }> },
) {
  const { confirmationToken } = await context.params;
  const appointment = await findAppointmentByToken(confirmationToken);

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const publicAppointment = toAppointmentPublicView(appointment);
  const ics = buildIcs(publicAppointment);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="grace-sessions-${confirmationToken}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}

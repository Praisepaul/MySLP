import type { AppointmentPublicView } from "@/lib/appointments/appointment-types";

function formatCalendarDate(value: string): string {
  return value.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function getCalendarTitle(appointment: AppointmentPublicView): string {
  return `Grace Sessions — ${appointment.service.name}`;
}

function getCalendarDescription(appointment: AppointmentPublicView): string {
  return `Appointment with Grace Sessions. Service: ${appointment.service.name}.`;
}

export function getGoogleCalendarUrl(appointment: AppointmentPublicView): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: getCalendarTitle(appointment),
    dates: `${formatCalendarDate(appointment.startAt)}/${formatCalendarDate(appointment.endAt)}`,
    details: getCalendarDescription(appointment),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(appointment: AppointmentPublicView): string {
  const params = new URLSearchParams({
    rru: "addevent",
    subject: getCalendarTitle(appointment),
    startdt: appointment.startAt,
    enddt: appointment.endAt,
    body: getCalendarDescription(appointment),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

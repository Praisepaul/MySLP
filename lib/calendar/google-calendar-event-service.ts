import { randomUUID } from "crypto";
import { google } from "googleapis";
import { getGoogleCalendarConfig, googleCalendarId } from "@/lib/calendar/google-calendar-config";
import { decryptGoogleRefreshToken } from "@/lib/calendar/google-calendar-crypto";
import { getGoogleCalendarConnection } from "@/lib/calendar/google-calendar-repository";
import type { AppointmentDocument } from "@/lib/appointments/appointment-types";

function createOAuthClient() {
  const config = getGoogleCalendarConfig();
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}

async function getAuthenticatedGoogleCalendar() {
  const connection = await getGoogleCalendarConnection();
  if (!connection) return null;
  const oauthClient = createOAuthClient();
  oauthClient.setCredentials({ refresh_token: decryptGoogleRefreshToken(connection.encryptedRefreshToken) });
  return google.calendar({ version: "v3", auth: oauthClient });
}

function getDeterministicEventId(confirmationToken: string) {
  return confirmationToken.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function getGoogleErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = Number(error.code);
  return Number.isFinite(code) ? code : null;
}

function getTherapistEmail() {
  return process.env.GOOGLE_CALENDAR_THERAPIST_EMAIL?.trim().toLowerCase() || null;
}

function getAttendees(appointment: AppointmentDocument) {
  const therapistEmail = getTherapistEmail();
  const emails = [appointment.patient.email, therapistEmail].filter((email): email is string => Boolean(email));
  return [...new Set(emails)].map((email) => ({ email, optional: false }));
}

function getConferenceData(appointment: AppointmentDocument) {
  if (!appointment.service.online) return undefined;
  return {
    createRequest: {
      requestId: randomUUID(),
      conferenceSolutionKey: { type: "hangoutsMeet" },
    },
  };
}

function getAppointmentManagementUrls(appointment: AppointmentDocument) {
  const { redirectUri } = getGoogleCalendarConfig();
  const origin = new URL(redirectUri).origin;
  const managementUrl = new URL(`/appointment/${encodeURIComponent(appointment.confirmationToken)}`, origin).toString();
  const rescheduleUrl = new URL(`/appointment/${encodeURIComponent(appointment.confirmationToken)}/reschedule`, origin).toString();
  return { managementUrl, rescheduleUrl };
}

function getEventDescription(appointment: AppointmentDocument) {
  const { managementUrl, rescheduleUrl } = getAppointmentManagementUrls(appointment);
  return [
    `Patient: ${appointment.patient.name}`,
    `Email: ${appointment.patient.email}`,
    `Session type: ${appointment.service.online ? "Online" : "In person"}`,
    "",
    "Manage this appointment:",
    managementUrl,
    "",
    "Reschedule appointment:",
    rescheduleUrl,
    "",
    "Cancellation is available from the appointment management page.",
  ].join("\n");
}

async function waitForMeetLink(calendar: ReturnType<typeof google.calendar>, eventId: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const event = await calendar.events.get({ calendarId: googleCalendarId, eventId, conferenceDataVersion: 1 });
    const meetUrl = event.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
    if (meetUrl) return meetUrl;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return undefined;
}

export type GoogleCalendarAppointmentEventResult = {
  eventId: string;
  meetJoinUrl?: string;
};

export async function createGoogleCalendarAppointmentEvent(appointment: AppointmentDocument): Promise<GoogleCalendarAppointmentEventResult | null> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar) return null;

  const eventId = getDeterministicEventId(appointment.confirmationToken);
  try {
    const response = await calendar.events.insert({
      calendarId: googleCalendarId,
      sendUpdates: "all",
      conferenceDataVersion: 1,
      requestBody: {
        id: eventId,
        summary: `Grace Sessions — ${appointment.service.name}`,
        description: getEventDescription(appointment),
        start: { dateTime: appointment.startAt.toISOString(), timeZone: appointment.timezone },
        end: { dateTime: appointment.endAt.toISOString(), timeZone: appointment.timezone },
        attendees: getAttendees(appointment),
        conferenceData: getConferenceData(appointment),
      },
    });
    const returnedEventId = response.data.id ?? eventId;
    const meetJoinUrl = appointment.service.online ? await waitForMeetLink(calendar, returnedEventId) : undefined;
    return { eventId: returnedEventId, ...(meetJoinUrl ? { meetJoinUrl } : {}) };
  } catch (error) {
    if (getGoogleErrorStatus(error) === 409) return { eventId };
    throw error;
  }
}

export async function updateGoogleCalendarAppointmentEvent(appointment: AppointmentDocument): Promise<string | undefined> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar || !appointment.googleCalendar?.eventId) return undefined;

  const response = await calendar.events.update({
    calendarId: googleCalendarId,
    eventId: appointment.googleCalendar.eventId,
    sendUpdates: "all",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Grace Sessions — ${appointment.service.name}`,
      description: getEventDescription(appointment),
      start: { dateTime: appointment.startAt.toISOString(), timeZone: appointment.timezone },
      end: { dateTime: appointment.endAt.toISOString(), timeZone: appointment.timezone },
      attendees: getAttendees(appointment),
    },
  });

  return response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri
    ?? appointment.googleMeet?.joinUrl;
}

export async function deleteGoogleCalendarAppointmentEvent(eventId: string): Promise<void> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar) return;
  try {
    await calendar.events.delete({ calendarId: googleCalendarId, eventId, sendUpdates: "all" });
  } catch (error) {
    if (getGoogleErrorStatus(error) === 404) return;
    throw error;
  }
}

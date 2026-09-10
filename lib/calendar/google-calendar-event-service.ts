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

export async function createGoogleCalendarAppointmentEvent(appointment: AppointmentDocument): Promise<string | null> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar) return null;

  const eventId = getDeterministicEventId(appointment.confirmationToken);
  try {
    const response = await calendar.events.insert({
      calendarId: googleCalendarId,
      sendUpdates: "none",
      requestBody: {
        id: eventId,
        summary: `Grace Sessions — ${appointment.service.name}`,
        description: `Patient: ${appointment.patient.name}\nEmail: ${appointment.patient.email}\nSession type: ${appointment.service.online ? "Online" : "In person"}`,
        start: { dateTime: appointment.startAt.toISOString(), timeZone: appointment.timezone },
        end: { dateTime: appointment.endAt.toISOString(), timeZone: appointment.timezone },
      },
    });
    return response.data.id ?? eventId;
  } catch (error) {
    if (getGoogleErrorStatus(error) === 409) return eventId;
    throw error;
  }
}

export async function deleteGoogleCalendarAppointmentEvent(eventId: string): Promise<void> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar) return;
  try {
    await calendar.events.delete({ calendarId: googleCalendarId, eventId, sendUpdates: "none" });
  } catch (error) {
    if (getGoogleErrorStatus(error) === 404) return;
    throw error;
  }
}

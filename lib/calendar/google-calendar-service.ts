import { google } from "googleapis";
import { getGoogleCalendarConfig, googleCalendarId, googleCalendarScopes } from "@/lib/calendar/google-calendar-config";
import { decryptGoogleRefreshToken, encryptGoogleRefreshToken } from "@/lib/calendar/google-calendar-crypto";
import { getGoogleCalendarConnection, saveGoogleCalendarConnection, getGoogleCalendarBusyCache, saveGoogleCalendarBusyCache } from "@/lib/calendar/google-calendar-repository";
import type { GoogleCalendarBusyInterval } from "@/lib/calendar/google-calendar-types";

function createOAuthClient() {
  const config = getGoogleCalendarConfig();
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}

export function getGoogleCalendarAuthorizationUrl(state: string): string {
  const oauthClient = createOAuthClient();
  return oauthClient.generateAuthUrl({ access_type: "offline", include_granted_scopes: true, prompt: "consent", scope: [...googleCalendarScopes], state });
}

export async function connectGoogleCalendar(code: string): Promise<void> {
  const oauthClient = createOAuthClient();
  const { tokens } = await oauthClient.getToken(code);
  if (!tokens.refresh_token) throw new Error("Google did not return a refresh token. Re-authorize with consent and try again.");
  await saveGoogleCalendarConnection({ calendarId: googleCalendarId, encryptedRefreshToken: encryptGoogleRefreshToken(tokens.refresh_token) });
}

async function getAuthenticatedGoogleCalendar() {
  const connection = await getGoogleCalendarConnection();
  if (!connection) return null;
  const oauthClient = createOAuthClient();
  oauthClient.setCredentials({ refresh_token: decryptGoogleRefreshToken(connection.encryptedRefreshToken) });
  return google.calendar({ version: "v3", auth: oauthClient });
}

export async function getGoogleCalendarBusyIntervals(start: Date, end: Date): Promise<GoogleCalendarBusyInterval[] | null> {
  const calendar = await getAuthenticatedGoogleCalendar();
  if (!calendar) return null;
  if (start >= end) throw new Error("Google Calendar free/busy range must have a positive duration.");
  const response = await calendar.freebusy.query({ requestBody: { timeMin: start.toISOString(), timeMax: end.toISOString(), timeZone: "UTC", items: [{ id: googleCalendarId }] } });
  const calendarData = response.data.calendars?.[googleCalendarId];
  if (!calendarData) throw new Error("Google Calendar did not return free/busy data for the configured calendar.");
  if (calendarData.errors?.length) throw new Error("Google Calendar could not read the configured calendar availability.");
  return (calendarData.busy ?? []).filter((interval) => interval.start && interval.end).map((interval) => ({ start: new Date(interval.start as string), end: new Date(interval.end as string) }));
}

export async function getCachedGoogleCalendarBusyIntervals(start: Date, end: Date): Promise<GoogleCalendarBusyInterval[] | null> {
  const cached = await getGoogleCalendarBusyCache(start, end);
  if (cached) return cached;

  const busyIntervals = await getGoogleCalendarBusyIntervals(start, end);
  if (busyIntervals === null) return null;
  await saveGoogleCalendarBusyCache({ calendarId: googleCalendarId, checkedFrom: start, checkedTo: end, busyIntervals });
  return busyIntervals;
}

export async function hasGoogleCalendarConnection(): Promise<boolean> {
  return Boolean(await getGoogleCalendarConnection());
}

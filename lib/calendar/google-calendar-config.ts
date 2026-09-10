export const googleCalendarScopes = [
  "https://www.googleapis.com/auth/calendar.freebusy",
] as const;

export function getGoogleCalendarConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar OAuth is not fully configured.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export const googleCalendarId = "primary";

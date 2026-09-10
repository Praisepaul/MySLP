# Phase 9 — Therapist Google Calendar Integration

## Goal

Connect the therapist's Google Calendar to Grace Sessions so the application can use Google Calendar free/busy data as an external conflict source during final appointment validation.

## Scope

- Google OAuth 2.0 web-server flow.
- Offline access with a refresh token.
- Minimal Calendar API scope: `https://www.googleapis.com/auth/calendar.freebusy`.
- Primary Google Calendar is used for Phase 9.
- Refresh token is encrypted before MongoDB storage.
- Manual 7-day free/busy check from the admin Calendar page.
- Booking revalidation checks Google Calendar conflicts when a connection exists.
- MongoDB remains the application source of truth.
- No cron jobs or background polling.

## Files

### Google Calendar domain/infrastructure

- `lib/calendar/google-calendar-config.ts`
  - `googleCalendarScopes`
  - `getGoogleCalendarConfig`
  - `googleCalendarId`
- `lib/calendar/google-calendar-types.ts`
  - `GoogleCalendarConnectionDocument`
  - `GoogleCalendarConnectionStatus`
  - `GoogleCalendarBusyInterval`
- `lib/calendar/google-calendar-crypto.ts`
  - `encryptGoogleRefreshToken`
  - `decryptGoogleRefreshToken`
- `lib/calendar/google-calendar-repository.ts`
  - `getGoogleCalendarConnection`
  - `saveGoogleCalendarConnection`
  - `deleteGoogleCalendarConnection`
  - `getGoogleCalendarConnectionStatus`
- `lib/calendar/google-calendar-service.ts`
  - `getGoogleCalendarAuthorizationUrl`
  - `connectGoogleCalendar`
  - `getGoogleCalendarBusyIntervals`
  - `hasGoogleCalendarConnection`

### Temporary setup access

- `lib/admin/setup-auth.ts`
  - `isSetupSecretConfigured`
  - `isGoogleCalendarConfigured`
  - `unlockGoogleCalendarSetup`
  - `isGoogleCalendarSetupUnlocked`
  - `requireGoogleCalendarSetupAccess`
  - `createGoogleCalendarOAuthState`
  - `consumeGoogleCalendarOAuthState`

This is intentionally a temporary setup gate. Full admin authentication/authorization will replace it in the later admin security work.

### API routes

- `app/api/admin/google-calendar/unlock/route.ts` — setup gate.
- `app/api/admin/google-calendar/connect/route.ts` — starts OAuth.
- `app/api/admin/google-calendar/callback/route.ts` — exchanges OAuth code and stores encrypted refresh token.
- `app/api/admin/google-calendar/status/route.ts` — connection status.
- `app/api/admin/google-calendar/disconnect/route.ts` — removes stored connection.
- `app/api/admin/google-calendar/sync/route.ts` — manually checks the next seven days of free/busy data.

### Admin UI

- `app/admin/calendar/page.tsx`
- `components/admin/calendar/google-calendar-card.tsx`

### Booking integration

- `lib/appointments/appointment-service.ts`
  - final booking validation now includes Google Calendar busy intervals when connected.

## MongoDB

Collection:

- `google_calendar_connections`

The application stores one therapist connection document containing:

- provider
- calendar ID (`primary` in Phase 9)
- encrypted refresh token
- created/updated timestamps

Access tokens are not persisted because the Google OAuth client can refresh them from the encrypted refresh token.

## Required environment variables

```env
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
GOOGLE_CALENDAR_SETUP_SECRET=
GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY=
```

Do not commit `.env.local` or any Google client secret/token.

## Google Cloud setup

1. Create or select a Google Cloud project.
2. Enable the Google Calendar API.
3. Configure the OAuth consent/branding screen.
4. Create a Web application OAuth client.
5. Add the local redirect URI:
   `http://localhost:3000/api/admin/google-calendar/callback`
6. Put the client ID and client secret into `.env.local`.
7. Generate a long random setup secret.
8. Generate a long random token-encryption secret and keep it stable.
9. Restart the Next.js development server after changing `.env.local`.

For production, create the production OAuth client/redirect URI separately and use HTTPS.

## Manual UI validation

1. Open `/admin/calendar`.
2. Enter the configured setup key.
3. Click **Connect Google Calendar**.
4. Authorize the therapist's Google account.
5. Return to Grace Sessions and confirm the connected state.
6. Click **Check calendar**.
7. Verify a successful seven-day free/busy check.
8. Create a real event in the therapist's primary Google Calendar.
9. Attempt to book a Grace Sessions slot overlapping that event.
10. Confirm Grace Sessions rejects the conflicting slot.
11. Delete/move the Google Calendar event.
12. Retry the booking and confirm it can proceed when the slot is otherwise available.
13. Test **Disconnect** and confirm the connection state clears.

## Security notes

- OAuth state is signed and stored in an HttpOnly, SameSite cookie.
- The setup gate is server-side and does not expose the setup secret to the application runtime beyond the request comparison.
- Refresh tokens are encrypted with AES-256-GCM before MongoDB storage.
- The booking engine fails closed when a configured Google Calendar cannot be checked.
- Only the minimum Phase 9 free/busy scope is requested.
- No calendar event details are copied into the application database.

## Deferred to later phases

- Full admin authentication/authorization.
- Selecting among multiple therapist calendars.
- Persisted incremental calendar synchronization.
- Google Calendar event creation.
- Google Meet creation.
- Calendar webhook/push notifications.
- Patient Google OAuth.

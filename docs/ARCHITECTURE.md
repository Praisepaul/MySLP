# Ephatha Architecture

## System boundary

Ephatha is a Next.js App Router application with MongoDB Atlas as the authoritative application database and Google Calendar as an external scheduling signal/event projection.

```text
Browser
  │
  ▼
Next.js pages + API routes
  │
  ├── domain/application services ── MongoDB Atlas
  │                                 (authoritative state)
  │
  └── calendar integration ─────── Google Calendar/Meet
                                     (external signal/projection)
```

## Source of truth

| Concern | Authority |
|---|---|
| Appointments | MongoDB |
| Booking concurrency | `appointment_booking_locks` |
| Services/availability/settings | MongoDB |
| Public/admin revision markers | MongoDB |
| Calendar free/busy | Google Calendar signal |
| Calendar event projection | Google Calendar |
| Online meeting | Google Meet via Calendar conference data |
| Theme preference | Browser local storage |

A Google failure must not delete or invalidate the MongoDB appointment. This separation is a core architectural invariant.

## Booking architecture

The booking path is:

1. Client selects service/date/time.
2. Public availability service calculates candidate slots from persisted configuration and availability plus conflict signals.
3. Server revalidates the submitted slot.
4. MongoDB booking lock protects the critical section.
5. Appointment is persisted.
6. Google Calendar event projection runs as an integration step.
7. Confirmation capability is returned.

The browser is never trusted as proof that a slot remains free.

### Booking modules

- `lib/booking/time-utils.ts`
- `lib/booking/availability-engine.ts`
- `lib/booking/conflict-engine.ts`
- `lib/booking/slot-engine.ts`
- `lib/booking/booking-engine.ts`
- `lib/booking/public-availability-service.ts`
- `lib/booking/slot-types.ts`
- `lib/config/booking-settings.ts`

`getBookableSlotsWithConfiguration()` is the persisted-config runtime boundary; `getBookableSlots()` remains the compatibility/default fallback.

## Appointment architecture

- `lib/appointments/appointment-types.ts`
- `lib/appointments/appointment-repository.ts`
- `lib/appointments/appointment-service.ts`

Repository responsibilities include indexes, idempotency lookup, confirmation-token lookup, overlap queries, admin queries, public projections, cancellation, status/schedule updates, and Google sync state.

Service responsibilities include `createAppointment`, `rescheduleAppointment`, and `cancelAppointment`, with `AppointmentBookingError` as the lifecycle error boundary.

## Google Calendar

Modules:

- `lib/calendar/google-calendar-config.ts`
- `lib/calendar/google-calendar-types.ts`
- `lib/calendar/google-calendar-crypto.ts`
- `lib/calendar/google-calendar-repository.ts`
- `lib/calendar/google-calendar-service.ts`
- `lib/calendar/google-calendar-event-service.ts`

Scopes are `calendar.freebusy` and `calendar.events`. Calendar event mutations use `sendUpdates: all` and online appointments request Google Meet through `conferenceData`.

`googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google API calendar identifier (`primary`). Never mix them.

## MongoDB connection lifecycle

`lib/db/mongodb.ts` is the single MongoDB connection boundary. It lazily creates a shared client per warm execution context, shares an in-flight connection attempt, and removes a failed initial promise after closing its client so a later request can recover from transient Atlas topology/network failures.

Current driver settings are bounded and serverless-oriented: `maxPoolSize: 10`, `maxIdleTimeMS: 60000`, `serverSelectionTimeoutMS: 15000`, `connectTimeoutMS: 10000`, retryable reads/writes, Atlas overload retargeting, and adaptive retries.

No broad application retry loop is added; this avoids turning an Atlas incident into amplified application traffic.

## Realtime synchronization

`lib/ui/use-data-sync.ts` coordinates revision-driven refreshes.

- `availability_revisions` (`_id=public-booking`) drives public booking freshness.
- `appointment_revisions` (`_id=admin-appointments`) drives the admin appointment workspace.
- `/api/availability/revision`, `/api/appointments/revision`, and `/api/admin/appointments/revision` expose revision state.

The public browser checks Mongo-only revision state approximately every three seconds while relevant UI is active. It does not continuously poll Google APIs.

## Authentication

`lib/admin/auth.ts` owns admin sessions, password hashing, login/logout and credential rotation. Sessions use a signed `__Host-grace_admin_session` cookie with Secure, HttpOnly, SameSite=Lax, Path=/ and an eight-hour lifetime. Credential-version binding invalidates old sessions after password-hash rotation.

`lib/admin/passkeys.ts` owns WebAuthn/passkey registration and authentication. Challenges are short-lived, server-side and single-use, with Mongo TTL storage and authenticator-counter concurrency protection. Production RP/origin are pinned through `GRACE_ADMIN_RP_ID` and `GRACE_ADMIN_ORIGIN`.

Authorization is always server-side. Hiding a control in the UI is never considered authorization.

## CMS

- `lib/cms/site-settings-repository.ts`
- `lib/cms/services-repository.ts`
- `lib/cms/availability-repository.ts`

Draft profile/settings data remains private until explicitly published. Profile media uses GridFS (`profile_media.files` and `profile_media.chunks`).

## Theme

`components/theme/theme-provider.tsx` and `components/theme/theme-toggle.tsx` implement `light`, `dark`, and `system`. Preference is local browser UI state only. It does not touch booking, authentication, MongoDB or Calendar behavior.

## Architectural constraints

Do not introduce another slot engine, make Google Calendar the booking database, add Google polling to the public realtime loop, trust client-side availability, authorize through UI state, expose secrets to the client, add broad Mongo retry loops, or create duplicate `-v2` service/repository trees.

When architecture changes, update `PROJECT_MAP.md` and this document together.

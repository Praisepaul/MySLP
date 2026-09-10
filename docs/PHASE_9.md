# Phase 9 — Therapist Google Calendar Integration

## Status

Phase 9 is complete. Phase 9.1 added low-cost live MongoDB availability synchronization, and Phase 9.2 adds intelligent conflict learning from live Google Calendar booking checks.

## Goal

Connect the therapist's Google Calendar to Grace Sessions so the application can use Google Calendar free/busy data as an external conflict source during availability calculation and final appointment validation.

## Scope completed

- Google OAuth 2.0 web-server flow.
- Offline access with an encrypted refresh token.
- Therapist primary Google Calendar integration.
- Google Calendar free/busy validation during final booking.
- Cached Google free/busy data for public availability.
- Manual Google Calendar synchronization from the admin Calendar page.
- Public availability returns only currently bookable dates/times.
- MongoDB `availability_revisions` singleton for cheap availability change detection.
- Visible booking pages poll the MongoDB revision every 3 seconds; this endpoint never calls Google Calendar.
- Booking and cancellation update the revision transactionally with MongoDB appointment/lock changes.
- Final booking validation remains authoritative and fail-closed.
- Patients never need Google OAuth.

## Phase 9.2 — Intelligent conflict learning

A booking attempt can discover a Google Calendar event before the next scheduled admin sync. When the live Google FreeBusy check reports a conflict:

1. The conflicting Google busy interval is stored in `google_calendar_discovered_conflicts`.
2. The public availability revision is bumped immediately when a new conflict is learned.
3. Other open booking pages detect that revision within the normal 3-second MongoDB poll.
4. The next availability calculation includes the learned conflict, so the slot disappears without requiring a Google API poll from every patient browser.
5. A later manual Google sync reconciles the learned conflicts against the real calendar and clears the learned records in the refreshed range.

These records are intentionally separate from `appointment_booking_locks`: a Grace Sessions booking lock represents an application reservation, while a discovered conflict represents an external calendar fact.

## Availability architecture

```text
Scheduled/manual Google sync ─────┐
                                  ├─> local Google busy cache
Live Google check during booking ─┤
                                  └─> discovered external conflicts
                                             │
Mongo appointments ─────────────────────────┤
Mongo booking locks ────────────────────────┤
                                             ↓
                                      bookable slots
                                             ↓
                                  availability_revisions
                                             ↓
                                  3-second visible clients
```

The system therefore avoids continuous Google polling while still becoming immediately smarter when a patient encounters a previously unseen external calendar conflict.

## MongoDB collections

- `google_calendar_connections` — therapist OAuth connection and encrypted refresh token.
- `google_calendar_busy_cache` — latest manually refreshed Google busy snapshot.
- `google_calendar_discovered_conflicts` — external conflicts learned from live booking-time checks and awaiting reconciliation.
- `availability_revisions` — singleton public availability revision used by the lightweight 3-second polling endpoint.
- `appointment_booking_locks` — concurrency protection for Grace Sessions bookings.
- `appointments` — authoritative application bookings.

## Important files/functions

### Google Calendar

- `lib/calendar/google-calendar-config.ts`
  - `googleCalendarScopes`
  - `getGoogleCalendarConfig`
  - `googleCalendarId`
- `lib/calendar/google-calendar-service.ts`
  - `getGoogleCalendarAuthorizationUrl`
  - `connectGoogleCalendar`
  - `getGoogleCalendarBusyIntervals`
  - `getCachedGoogleCalendarBusyIntervals`
  - `hasGoogleCalendarConnection`
- `lib/calendar/google-calendar-repository.ts`
  - `getGoogleCalendarConnection`
  - `saveGoogleCalendarConnection`
  - `deleteGoogleCalendarConnection`
  - `saveGoogleCalendarBusyCache`
  - `getGoogleCalendarBusyCache`
  - `saveDiscoveredGoogleCalendarConflict`
  - `getDiscoveredGoogleCalendarConflicts`
  - `clearDiscoveredGoogleCalendarConflicts`

### Booking / live availability

- `lib/appointments/appointment-repository.ts`
  - `getBookingLocksRevision`
  - `bumpBookingLocksRevision`
  - `bumpPublicAvailabilityRevision`
  - `updateGoogleCalendarSyncStatus`
  - `cancelAppointment`
- `lib/appointments/appointment-service.ts`
  - `createAppointment`
  - learns Google conflicts when the live final check rejects the requested slot
- `app/api/availability/revision/route.ts`
  - Mongo-only revision endpoint
- `components/public/booking/booking-flow.tsx`
  - 3-second visible-tab polling
- `lib/booking/public-availability-service.ts`
  - combines application conflicts with cached/learned Google conflicts

## Final booking rule

The local cache is an optimization and UX mechanism, not the authority for the therapist's Google Calendar. Every booking still performs a live Google FreeBusy check before the MongoDB transaction. If Google is unavailable, the booking fails closed.

## Scheduled reconciliation

The admin Google sync covers the current public booking horizon plus boundary padding. It clears learned external conflicts in the refreshed range and replaces the Google busy snapshot with fresh data. A successful reconciliation bumps the public availability revision so open patient pages update automatically.

## Security / cost principles

- No continuous Google polling from patient browsers.
- The 3-second polling endpoint reads only one lightweight MongoDB revision document.
- Google API calls happen for the scheduled/manual sync and the authoritative final booking check, not on every browser poll.
- Patients do not receive Google event details or conflict-source metadata.
- MongoDB remains the application booking source of truth.

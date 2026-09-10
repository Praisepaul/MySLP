# Live availability synchronization

## Decision

Public booking pages now refresh availability from MongoDB booking-lock changes without polling Google Calendar every few seconds.

The intended cadence is:

- Google Calendar free/busy: therapist manually syncs approximately morning, afternoon and evening.
- MongoDB booking state: browser checks a lightweight singleton revision every 3 seconds while the booking page is visible.
- Google Calendar is never queried on each 3-second revision check.

## Flow

```text
Booking page
  ↓ every 3 seconds while visible
GET /api/availability/revision
  ↓
MongoDB availability_revisions
  ↓ revision changed?
  ├─ no → do nothing
  └─ yes → POST /api/availability
              ↓
        appointments + cached Google Calendar conflicts
              ↓
        new bookable slots
```

## Why this is cheap

`/api/availability/revision` performs one MongoDB singleton-document read after the revision has been initialized. It does not call Google Calendar.

Booking creation and cancellation bump the revision inside the same MongoDB transaction as the booking-lock mutation, so the public revision cannot announce a change for a transaction that later rolls back.

When the revision changes, `/api/availability` recomputes slots using MongoDB appointments plus the cached Google Calendar free/busy snapshot. The browser therefore does not need a full page refresh.

The browser pauses polling while the tab is hidden.

## Google Calendar cache

`google_calendar_busy_cache` stores the latest therapist free/busy snapshot. The admin Google Calendar sync endpoint refreshes a window covering the public booking horizon. Availability recalculation uses the cache, while final appointment creation performs a live Google Calendar check for correctness.

## Files

- `lib/appointments/appointment-repository.ts`
  - `getBookingLocksRevision`
  - `bumpBookingLocksRevision`
- `app/api/availability/revision/route.ts`
  - lightweight MongoDB revision endpoint
- `components/public/booking/booking-flow.tsx`
  - 3-second visible-tab revision polling
  - refreshes availability only after a lock revision changes
- `lib/calendar/google-calendar-repository.ts`
  - Google Calendar busy cache
- `lib/calendar/google-calendar-service.ts`
  - cached public availability checks
- `lib/booking/public-availability-service.ts`
  - uses cached Google Calendar conflicts
- `app/api/admin/google-calendar/sync/route.ts`
  - refreshes and persists the Google Calendar free/busy snapshot

## Safety properties

- Booking locks remain authoritative for appointment collision protection.
- Final booking validation still checks live Google Calendar availability.
- Fast background revision checks are MongoDB-only.
- No cron job or third-party real-time subscription is introduced.
- Hidden browser tabs do not generate revision checks.

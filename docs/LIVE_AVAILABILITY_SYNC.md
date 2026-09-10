# Live availability synchronization

## Decision

Public booking pages now refresh availability from MongoDB booking-lock changes without polling Google Calendar every few minutes.

The intended cadence is:

- Google Calendar free/busy: therapist manually syncs approximately morning, afternoon and evening.
- MongoDB booking locks: browser checks a lightweight revision every 3 minutes while the booking page is visible.
- Google Calendar is never queried on each 3-minute revision check.

## Flow

```text
Booking page
  ↓ every 3 minutes while visible
GET /api/availability/revision
  ↓
MongoDB appointment_booking_locks
  ↓ revision changed?
POST /api/availability
  ↓
appointments + cached Google Calendar conflicts
  ↓
new bookable slots
```

## Why this is cheap

`/api/availability/revision` performs only MongoDB reads: a lock count and the newest lock `_id`. It does not call Google Calendar.

When the revision changes, `/api/availability` recomputes slots using MongoDB appointments plus the cached Google Calendar free/busy snapshot. The browser therefore does not need a full page refresh.

The browser pauses the polling while the tab is hidden.

## Google Calendar cache

`google_calendar_busy_cache` stores the latest therapist free/busy snapshot. The admin Google Calendar sync endpoint refreshes a window covering the public booking horizon. A first availability request can warm the cache if it is missing; subsequent lock-driven refreshes use MongoDB cache data only.

Final appointment creation remains fail-closed and performs a live Google Calendar free/busy check before the transaction-backed booking locks are inserted. This preserves double-booking protection even if the public availability snapshot is stale.

## Files

- `lib/appointments/appointment-repository.ts`
  - `getBookingLocksRevision`
- `app/api/availability/revision/route.ts`
  - lightweight MongoDB revision endpoint
- `components/public/booking/booking-flow.tsx`
  - 3-minute visible-tab revision polling
  - refreshes availability only after a lock revision changes
- `lib/calendar/google-calendar-repository.ts`
  - `saveGoogleCalendarBusyCache`
  - `getGoogleCalendarBusyCache`
- `lib/calendar/google-calendar-service.ts`
  - `getCachedGoogleCalendarBusyIntervals`
- `lib/booking/public-availability-service.ts`
  - uses cached Google Calendar conflicts
- `app/api/admin/google-calendar/sync/route.ts`
  - refreshes and persists the Google Calendar free/busy snapshot

## Safety properties

- Booking locks remain authoritative for appointment collision protection.
- Final booking validation still checks live Google Calendar availability.
- Google Calendar event details are not persisted; only free/busy intervals are cached.
- No cron job or third-party real-time subscription is introduced.
- Hidden browser tabs do not generate the 3-minute revision checks.

# Project Architecture Map

## Current phases

- Phase 9: Therapist Google Calendar OAuth + FreeBusy availability — complete.
- Phase 9.1: Live MongoDB availability synchronization — implemented with 3-second visible-tab revision polling.
- Phase 10: Therapist Google Calendar event creation/cancellation projection — implemented; requires therapist OAuth reauthorization and local end-to-end validation.

## Booking architecture

```text
Patient booking page
  ├─ POST /api/availability
  ├─ every 3 seconds while visible → GET /api/availability/revision
  │     └─ MongoDB availability_revisions only
  └─ revision changed → POST /api/availability
        ├─ MongoDB appointments
        └─ cached Google Calendar busy intervals

Final booking
  POST /api/appointments
    ├─ live Google Calendar FreeBusy check (fail closed)
    ├─ MongoDB transaction
    │    ├─ appointment_booking_locks
    │    ├─ appointments
    │    └─ availability_revisions
    └─ after commit → Google Calendar event projection

Cancellation
  DELETE /api/appointments/[confirmationToken]
    ├─ MongoDB appointment + lock transaction
    ├─ availability revision bump
    └─ remove Google Calendar event when synced
```

## Important files/functions

- `lib/appointments/appointment-repository.ts`
  - `getBookingLocksRevision`
  - `bumpBookingLocksRevision`
  - `updateGoogleCalendarSyncStatus`
  - `cancelAppointment`
  - `toAppointmentPublicView`
- `lib/appointments/appointment-service.ts`
  - `createAppointment`
- `app/api/availability/revision/route.ts`
  - Mongo-only revision endpoint
- `components/public/booking/booking-flow.tsx`
  - 3-second visible-tab polling
- `lib/calendar/google-calendar-config.ts`
  - FreeBusy + Calendar Events OAuth scopes
- `lib/calendar/google-calendar-service.ts`
  - live/cached FreeBusy operations
- `lib/calendar/google-calendar-event-service.ts`
  - therapist event create/delete
- `lib/calendar/google-calendar-repository.ts`
  - therapist connection + FreeBusy cache persistence
- `app/api/admin/google-calendar/sync/route.ts`
  - manual FreeBusy cache refresh
- `docs/LIVE_AVAILABILITY_SYNC.md`
  - live sync design
- `docs/PHASE_10.md`
  - Phase 10 event integration design

## Product principles

- MongoDB is the application booking source of truth.
- Booking locks are the concurrency protection.
- Public availability shows only genuinely bookable slots.
- Final booking validation remains authoritative.
- Patients are never required to connect Google Calendar.
- Patient calendar export remains provider-neutral (Google/Apple/Outlook/.ics).
- Sister/admin normal operations must remain no-code CRUD.
- Therapist Google Calendar is an integration/projection, not the application database.

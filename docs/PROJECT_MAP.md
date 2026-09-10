# Project Architecture Map

## Current phases

- Phase 9: Therapist Google Calendar OAuth + FreeBusy availability — complete.
- Phase 9.1: Live MongoDB availability synchronization — complete with 3-second visible-tab revision polling.
- Phase 9.2: Intelligent Google conflict learning — complete; booking-time Google conflicts are remembered in MongoDB and propagated through the same revision system.
- Phase 10: Therapist Google Calendar event creation/cancellation projection — implemented; requires therapist OAuth reauthorization and local end-to-end validation.

## Booking architecture

```text
Patient booking page
  ├─ POST /api/availability
  ├─ every 3 seconds while visible → GET /api/availability/revision
  │     └─ MongoDB availability_revisions only
  └─ revision changed → POST /api/availability
        ├─ MongoDB appointments
        ├─ cached Google Calendar busy intervals
        └─ learned Google Calendar conflicts

Final booking
  POST /api/appointments
    ├─ live Google Calendar FreeBusy check (fail closed)
    │    └─ if busy → learn external conflict in MongoDB
    │                 └─ bump availability_revisions
    ├─ MongoDB transaction
    │    ├─ appointment_booking_locks
    │    ├─ appointments
    │    └─ availability_revisions
    └─ after commit → Google Calendar event projection

Manual Google sync
  POST /api/admin/google-calendar/sync
    ├─ fresh Google FreeBusy snapshot
    ├─ reconcile/clear learned conflicts in checked range
    ├─ refresh google_calendar_busy_cache
    └─ bump availability_revisions

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
  - `bumpPublicAvailabilityRevision`
  - `updateGoogleCalendarSyncStatus`
  - `cancelAppointment`
  - `toAppointmentPublicView`
- `lib/appointments/appointment-service.ts`
  - `createAppointment`
  - learns live Google Calendar conflicts when a requested slot is rejected
- `app/api/availability/revision/route.ts`
  - Mongo-only revision endpoint
- `components/public/booking/booking-flow.tsx`
  - 3-second visible-tab polling
- `lib/booking/public-availability-service.ts`
  - server-side bookable-slot calculation
- `lib/calendar/google-calendar-config.ts`
  - FreeBusy + Calendar Events OAuth scopes
- `lib/calendar/google-calendar-service.ts`
  - live Google FreeBusy
  - cached + learned conflict aggregation
- `lib/calendar/google-calendar-event-service.ts`
  - therapist event create/delete
- `lib/calendar/google-calendar-repository.ts`
  - therapist connection
  - FreeBusy cache
  - learned external conflict persistence/reconciliation
- `app/api/admin/google-calendar/sync/route.ts`
  - manual Google FreeBusy synchronization and conflict reconciliation
- `docs/LIVE_AVAILABILITY_SYNC.md`
  - live sync design
- `docs/PHASE_9.md`
  - completed Phase 9 + Phase 9.1/9.2 availability architecture
- `docs/PHASE_10.md`
  - Phase 10 event integration design

## Product principles

- MongoDB is the application booking source of truth.
- `appointment_booking_locks` are concurrency protection for Grace Sessions bookings.
- External Google conflicts are stored separately from booking locks.
- Public availability shows only genuinely bookable slots.
- Final booking validation remains authoritative.
- Patients are never required to connect Google Calendar.
- Patient calendar export remains provider-neutral (Google/Apple/Outlook/.ics).
- Therapist Google Calendar is an integration/projection, not the application database.
- The 3-second browser sync reads only MongoDB and never calls Google Calendar.
- User actions can teach the local availability model about previously unseen Google conflicts without continuous API polling.
- Sister/admin normal operations must remain no-code CRUD.

# Phase 7 — Appointment Management

## Status

Implemented in the `phase-7-appointments` branch and ready for local dependency/environment validation before merging to `main`.

## Goal

Move Grace Sessions from the Phase 6 booking preview into real appointment creation and patient appointment management while keeping MongoDB and infrastructure outside the booking calculation domain.

## What was added

### Persistence

- `lib/db/mongodb.ts`
  - `getMongoClient`
  - `getMongoDb`
  - Reusable MongoClient promise for server runtimes.
- `lib/appointments/appointment-types.ts`
  - `AppointmentStatus`
  - `AppointmentDocument`
  - `AppointmentPublicView`
  - `isAppointmentStatus`
- `lib/appointments/appointment-repository.ts`
  - `ensureAppointmentIndexes`
  - `findAppointmentByIdempotencyKey`
  - `findAppointmentByToken`
  - `findActiveAppointmentsOverlapping`
  - `toAppointmentPublicView`
  - `cancelAppointment`

MongoDB collections:

- `appointments`
- `appointment_booking_locks`

The lock collection uses a unique 30-minute UTC bucket index. The server creates lock documents and the appointment in one MongoDB transaction. This gives overlapping bookings a database-enforced collision point instead of relying only on the client's displayed availability.

### Server booking service

- `lib/appointments/appointment-service.ts`
  - `createAppointment`
  - request validation
  - timezone validation
  - service validation
  - server-side slot revalidation
  - existing appointment conflict loading
  - idempotency handling
  - transaction-based booking locks

The browser is not trusted for final availability. The API receives only the selected service, UTC start, timezone and minimal patient details, then recalculates the requested slot on the server before writing.

### API

- `app/api/appointments/route.ts`
  - `POST` creates an appointment.
- `app/api/appointments/[confirmationToken]/route.ts`
  - `GET` retrieves a patient appointment by its unguessable confirmation token.
  - `DELETE` cancels a future confirmed appointment.

### Patient experience

- `components/public/booking/booking-confirmation.tsx`
  - confirmed appointment presentation and management link.
- `components/public/appointments/appointment-management.tsx`
  - appointment review
  - cancellation
  - error/loading handling
- `app/appointment/[confirmationToken]/page.tsx`
  - patient-facing appointment management route.
- `components/public/booking/booking-summary.tsx`
  - now confirms the appointment rather than completing a preview.
- `components/public/booking/booking-flow.tsx`
  - calls the server API
  - handles submission state
  - handles stale-slot conflicts
  - displays the real confirmation state.

## Data intentionally stored

Only scheduling data is persisted:

- patient name
- patient email
- service snapshot
- appointment start/end in UTC
- selected timezone
- appointment status
- confirmation token
- idempotency key
- created/updated/cancelled timestamps

No clinical information or patient account is introduced.

## Appointment lifecycle

```text
confirmed
   ↓
completed / no_show

confirmed
   ↓
cancelled
```

Phase 7 only exposes patient cancellation for future confirmed appointments. Admin status management remains part of the later admin appointment phase.

## Idempotency

Every booking submission gets a client-generated idempotency key. The database has a unique index on that key. If a retry reaches the server after the appointment was already created, the existing appointment can be returned instead of creating a duplicate.

## Environment setup required after implementation

Create a local `.env.local` using `.env.example`:

```text
MONGODB_URI=<MongoDB Atlas connection string>
MONGODB_DB=grace_sessions
```

No MongoDB credentials are committed to the repository.

## Important validation

The implementation was written against the current GitHub source, but the assistant cannot run the user's local Windows Node environment. After pulling/installing the new dependency, run:

```text
npm install
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Then configure MongoDB Atlas and test:

1. Open `/book`.
2. Complete a real booking.
3. Confirm an appointment document is created.
4. Confirm the confirmation page appears.
5. Open the management link.
6. Cancel the appointment.
7. Confirm the appointment status becomes `cancelled`.
8. Confirm the booking locks are released.
9. Attempt two overlapping bookings and verify only one succeeds.
10. Attempt the same booking request twice with the same idempotency key in an API-level test and verify no duplicate appointment is created.

## Not included yet

- Email notifications.
- Google Calendar synchronization.
- Google Meet creation.
- Patient calendar exports.
- Admin appointment CRUD/status management.
- Authentication/authorization for admin.
- Production security hardening and rate limiting.

Those remain intentionally separated into later phases.

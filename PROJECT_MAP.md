# Grace Session Scheduler — Project Map

> Authoritative architecture/progress map. `main` is the source of truth. Update this file whenever phases, architecture, filenames or important functions change.

## Product rules
- No patient accounts; no clinical notes.
- MongoDB is authoritative for Grace Sessions appointments and booking state.
- `appointment_booking_locks` is reserved for Grace Sessions concurrency.
- Google Calendar is the therapist-calendar integration/external free-busy signal and event projection.
- `googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google Calendar API identifier (`primary`).
- Online appointments request Google Meet through Calendar conference data.
- Calendar create/update/delete uses `sendUpdates: all` for current lightweight guest notifications.
- Public availability synchronization is MongoDB-revision driven; the 3-second loop never polls Google.
- Admin should eventually operate the whole product without source-code edits.
- Reuse existing booking, conflict, lock, appointment and calendar services; do not create parallel scheduling logic.

## Technology
Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MongoDB driver/Atlas, Google Calendar API/OAuth, Google Meet via Calendar conferenceData.

## Architecture
```text
PUBLIC
  /                         profile
  /book                     booking
  /appointment/[token]      appointment management
  /appointment/[token]/reschedule

ADMIN
  /admin
  /admin/services
  /admin/availability
  /admin/calendar
  /admin/appointments
  /admin/profile
  /admin/booking-settings

CMS
  lib/cms/site-settings-repository.ts
  MongoDB: site_settings

BOOKING
  lib/booking/slot-types.ts
  lib/booking/time-utils.ts
  lib/booking/availability-engine.ts
  lib/booking/conflict-engine.ts
  lib/booking/slot-engine.ts
  lib/booking/booking-engine.ts
  lib/booking/public-availability-service.ts

APPOINTMENTS
  lib/appointments/appointment-types.ts
  lib/appointments/appointment-repository.ts
  lib/appointments/appointment-service.ts

CALENDAR
  lib/calendar/google-calendar-config.ts
  lib/calendar/google-calendar-types.ts
  lib/calendar/google-calendar-crypto.ts
  lib/calendar/google-calendar-repository.ts
  lib/calendar/google-calendar-service.ts
  lib/calendar/google-calendar-event-service.ts

MONGO COLLECTIONS
  appointments
  appointment_booking_locks
  google_calendar_connections
  google_calendar_busy_cache
  google_calendar_discovered_conflicts
  availability_revisions
  appointment_revisions
  site_settings
```

# Phase status

## Phase 0 — Foundation
**Complete.**

## Phase 1 — Design system + shells
**Complete.**

## Phase 2 — Public therapist profile
**Complete + CMS connected.** Public homepage now loads `getTherapistProfile()` from `lib/cms/site-settings-repository.ts`, with the original config retained as a safe default.

## Phase 3 — Services CMS
**Functional UI only; persistence still required.** `lib/config/services.ts`, service list/form and `/admin/services` exist, but service mutations are not yet Mongo-backed.

## Phase 4 — Availability management
**Functional UI/core rules only; persistence still required.** `lib/config/availability.ts` and admin availability components exist, but recurring rules/exceptions are still config-backed.

## Phase 5 — Booking engine
**Complete.** Existing slot/conflict logic remains authoritative. `getBookableSlotsWithConfiguration()` was added as a reusable runtime configuration boundary; existing `getBookableSlots()` remains for compatibility/defaults.

## Phase 6 — Patient booking experience
**Complete.** Service → timezone → date/time → details → review → appointment creation.

## Phase 7 — Appointment persistence/management
**Complete and locally validated.** `createAppointment`, `rescheduleAppointment`, `cancelAppointment`, idempotency and transactional booking locks are established.

## Phase 8 — Patient calendar support
**Complete and locally validated.** Google Calendar, Outlook, Apple/ICS support.

## Phase 9 — Therapist Google Calendar
**Complete and validated.** OAuth, encrypted refresh tokens, FreeBusy, cached busy data, manual sync, disconnect and fail-closed final validation.

## Phase 9.1 — Public availability realtime
**Complete and validated.** Mongo-only revision checking every ~3 seconds while visible; Google is not polled by the browser loop.

## Phase 9.2 — External conflict learning
**Complete.** Final Google conflicts can be persisted to `google_calendar_discovered_conflicts` and bump public availability revision.

## Phase 10 — Google Calendar events + Meet
**Complete and end-to-end validated.** Deterministic event projection, update/delete, Google Meet, attendee notifications and public rescheduling are implemented.

## Phase 11 — Admin appointment management
**Active.** Implemented list/search/status/date filters, details in list, Meet, Calendar sync state, completed/no-show/cancel, realtime revision sync and manual Refresh. Admin API already supports reschedule through existing `rescheduleAppointment`.

Remaining: day/week visual calendar, dedicated detail view, native availability-picker rescheduling UI, manual admin creation UI, richer operational controls/retry and real admin authentication.

Key files:
- `app/admin/appointments/page.tsx`
- `components/admin/appointments/admin-appointments-manager.tsx`
- `app/api/admin/appointments/route.ts`
- `app/api/admin/appointments/revision/route.ts`
- `lib/appointments/appointment-repository.ts`
- `lib/appointments/appointment-service.ts`

## Phase 12 — Profile CMS
**Implemented initial persisted CMS.**

Files:
- `lib/cms/site-settings-repository.ts`
- `app/admin/profile/page.tsx`
- `app/api/admin/profile/route.ts`
- `components/admin/profile/profile-form.tsx`

Mongo document: `site_settings`, `_id = therapist-profile`.

Editable: name, professional title, short/long bio, credentials, languages, location, timezone, online/in-person availability, profile image address, email, phone, website, Instagram, LinkedIn.

Public homepage sections using the profile: `profile-hero.tsx`, `profile-about.tsx`, `profile-services-preview.tsx`, wired by `app/page.tsx`.

The profile image field is currently an image address rather than a storage upload; a true uploader waits for a storage provider decision.

## Phase 13 — Booking settings CMS
**Implemented initial persisted CMS + runtime enforcement.**

Files:
- `app/admin/booking-settings/page.tsx`
- `app/api/admin/booking-settings/route.ts`
- `components/admin/booking-settings/booking-settings-form.tsx`
- `lib/cms/site-settings-repository.ts`
- `lib/booking/booking-engine.ts`
- `lib/booking/public-availability-service.ts`
- `lib/appointments/appointment-service.ts`

Mongo document: `site_settings`, `_id = booking-settings`.

Editable: booking enabled, minimum notice, maximum advance, slot interval, before/after buffers, cancellation policy, rescheduling policy, booking instructions.

Runtime: public availability, appointment creation and appointment rescheduling load persisted settings. Saving settings bumps the existing public availability revision. No duplicate booking engine was introduced.

## Phase 14 — Internationalization
**Planned.** English, Portuguese, Hindi across all user-facing surfaces with timezone-aware date/time formatting.

## Phase 15 — Notifications
**Planned.** Custom provider-independent transactional notifications/reminders only where Google Calendar notifications are insufficient.

## Phase 16 — Security/privacy
**Planned.** Replace temporary setup auth, harden tokens/rate limits, validation, secrets, privacy, abuse protection and error redaction.

## Phase 17 — Responsive/accessibility final pass
**Planned.** Mobile/tablet/desktop, keyboard/focus, semantics, contrast, forms, dialogs, calendar and touch targets.

## Phase 18 — Automated testing
**Planned.** Booking/DST/concurrency/lifecycle/Google/API regression suite.

## Phase 19 — Production deployment
**Planned.** Vercel + MongoDB Atlas + Google Cloud OAuth, production secrets/configuration, smoke tests, monitoring and recovery.

## Phase 20 — Handover
**Planned.** Non-technical therapist operating guide covering appointments, services, availability, profile, settings, Calendar, Meet, conflicts and sync failures.

# Current source-of-truth rules
1. `main` is the working branch unless explicitly changed.
2. Inspect latest `main` before every change.
3. Preserve existing filenames/functions/types unless a justified architectural change requires otherwise.
4. MongoDB is authoritative for application booking state.
5. Never bypass booking validation or booking locks.
6. Google external conflicts belong in `google_calendar_discovered_conflicts`.
7. Never poll Google Calendar from the public revision loop.
8. CMS persistence belongs in `site_settings` until a more specific persisted domain collection is justified.
9. Do not add cron/Redis/Kafka/microservices unless explicitly requested.
10. Before production-ready claims, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` and relevant lifecycle tests locally.

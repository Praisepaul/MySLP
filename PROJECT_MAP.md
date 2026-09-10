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
  /                         persisted therapist profile + services preview
  /book                     persisted services + booking engine
  /appointment/[token]      appointment management
  /appointment/[token]/reschedule

ADMIN
  /admin
  /admin/services           persistent Services CMS
  /admin/availability       persistent Availability CMS
  /admin/calendar
  /admin/appointments
  /admin/profile            persistent Profile CMS
  /admin/booking-settings   persistent Booking Settings CMS

CMS
  lib/cms/site-settings-repository.ts
  lib/cms/services-repository.ts
  lib/cms/availability-repository.ts
  MongoDB: site_settings
  MongoDB: cms_services
  MongoDB: cms_availability

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
  cms_services
  cms_availability
```

# Phase status

## Phase 0 — Foundation
**Complete.**

## Phase 1 — Design system + shells
**Complete.** Current CMS/admin button placement and layout are intentionally preserved while functionality is connected.

## Phase 2 — Public therapist profile
**Complete + CMS connected.** Public homepage loads `getTherapistProfile()` from `lib/cms/site-settings-repository.ts`, with the original config retained as a safe default.

## Phase 3 — Services CMS
**Implemented persisted CMS.**

Files:
- `lib/cms/services-repository.ts`
- `app/api/admin/services/route.ts`
- `components/admin/services/services-manager.tsx`
- `components/admin/services/services-manager-v2.tsx`
- `components/admin/services/services-list.tsx`
- `components/admin/services/service-form.tsx`
- `app/admin/services/page.tsx`
- `components/public/profile/profile-services-preview.tsx`
- `components/public/booking/booking-flow.tsx`
- `app/book/page.tsx`
- `app/appointment/[confirmationToken]/reschedule/page.tsx`
- `lib/appointments/appointment-service.ts`

Mongo collection: `cms_services`.

`getServices()` uses the existing config as a one-time-safe fallback when Mongo has no records. `upsertService`, `setServiceActive`, `disableService` and `deleteService` persist changes. Service disabling is soft-disable; existing appointment snapshots are not rewritten. New service IDs are generated internally from the service name; therapists do not need to enter an ID.

Public service preview, booking selection, booking creation, and rescheduling now consume the persisted service repository rather than the static service array. Server-to-client service props are explicitly serialized so Mongo `_id` values never cross the Client Component boundary.

## Phase 4 — Availability management
**Implemented persisted CMS.**

Files:
- `lib/cms/availability-repository.ts`
- `app/api/admin/availability/route.ts`
- `components/admin/availability/availability-manager.tsx`
- `components/admin/availability/availability-manager-v2.tsx`
- `components/admin/availability/availability-exception-form.tsx`
- `components/admin/availability/availability-rules-list.tsx`
- `components/admin/availability/availability-rules-list-v2.tsx`
- `components/admin/availability/availability-rule-form.tsx`
- `components/admin/availability/availability-exceptions-list.tsx`
- `components/admin/availability/availability-exceptions-list-v2.tsx`
- `app/admin/availability/page.tsx`
- `lib/booking/public-availability-service.ts`
- `lib/appointments/appointment-service.ts`

Mongo collection: `cms_availability`.

Weekly rules and date exceptions are persisted as one authoritative configuration document. Existing validation functions from `lib/config/availability.ts` remain the validation boundary. Saving configuration bumps the existing public availability revision.

Public availability, appointment creation and appointment rescheduling now consume persisted availability configuration.

## Phase 5 — Booking engine
**Complete.** Existing slot/conflict logic remains authoritative. `getBookableSlotsWithConfiguration()` is the reusable runtime configuration boundary; `getBookableSlots()` remains for compatibility/defaults.

## Phase 6 — Patient booking experience
**Complete.** Service → timezone → date/time → details → review → appointment creation.

## Phase 7 — Appointment persistence/management
**Complete and previously locally validated.** `createAppointment`, `rescheduleAppointment`, `cancelAppointment`, idempotency and transactional booking locks are established.

## Phase 8 — Patient calendar support
**Complete and previously locally validated.** Google Calendar, Outlook, Apple/ICS support.

## Phase 9 — Therapist Google Calendar
**Complete and previously validated.** OAuth, encrypted refresh tokens, FreeBusy, cached busy data, manual sync, disconnect and fail-closed final validation.

## Phase 9.1 — Public availability realtime
**Complete and previously validated.** Mongo-only revision checking every ~3 seconds while visible; Google is not polled by the browser loop.

## Phase 9.2 — External conflict learning
**Complete.** Final Google conflicts can be persisted to `google_calendar_discovered_conflicts` and bump public availability revision.

## Phase 10 — Google Calendar events + Meet
**Complete and end-to-end validated.** Deterministic event projection, update/delete, Google Meet, attendee notifications and public rescheduling are implemented.

## Phase 11 — Admin appointment management
**Active.** Implemented list/search/status/date filters, details in list, Meet, Calendar sync state, completed/no-show/cancel, realtime revision sync and manual Refresh. Admin API already supports reschedule through existing `rescheduleAppointment`.

Remaining: day/week visual calendar, dedicated detail view, native availability-picker rescheduling UI, manual admin creation UI, richer operational controls/retry and real admin authentication.

## Phase 12 — Profile CMS
**Implemented initial persisted CMS.** Mongo document: `site_settings`, `_id = therapist-profile`. Profile image is currently an external direct-image URL; the public hero safely falls back if the supplied URL is not a loadable image instead of crashing the page.

## Phase 13 — Booking settings CMS
**Implemented initial persisted CMS + runtime enforcement.** Mongo document: `site_settings`, `_id = booking-settings`.

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
5. Services are authoritative in `cms_services` once persisted; static service config is fallback only for an uninitialized installation.
6. Availability rules/exceptions are authoritative in `cms_availability` once persisted; static availability config is fallback only for an uninitialized installation.
7. Never bypass booking validation or booking locks.
8. Google external conflicts belong in `google_calendar_discovered_conflicts`.
9. Never poll Google Calendar from the public revision loop.
10. CMS writes affecting availability bump the existing `availability_revisions` singleton.
11. Do not add cron/Redis/Kafka/microservices unless explicitly requested.
12. Before production-ready claims, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` and relevant lifecycle tests locally.

# Grace Session Scheduler — Project Map

> **Authoritative architecture and progress map.** Keep this file current whenever the codebase, phase status, filenames, functions, integrations, or architectural decisions change. The latest `main` implementation is the source of truth.

## Product purpose

Grace Session Scheduler is a lightweight, multilingual, Calendly-like appointment scheduler for a speech-language pathologist. Patients do not create accounts. MongoDB is the application booking source of truth; Google Calendar is the therapist's external availability/event projection.

## Core product decisions

- No patient login.
- Store only scheduling data; no clinical notes.
- Appointment timestamps are stored in UTC.
- Public times are displayed in the patient's selected/detected IANA timezone.
- Patients are not required to authorize Google Calendar.
- Therapist Google Calendar is connected through OAuth 2.0.
- Google Calendar primary calendar blocks availability and receives Grace Sessions events.
- Online appointments automatically request a Google Meet conference.
- Patient and therapist are required Google Calendar guests when `GOOGLE_CALENDAR_THERAPIST_EMAIL` is configured.
- Google Calendar `sendUpdates: all` is the current lightweight notification mechanism for appointment creation, changes, and cancellation.
- Patient calendar support is provider-neutral: Google Calendar, Outlook, Apple Calendar/ICS.
- No cron jobs or Google polling from the 3-second availability loop.
- MongoDB availability revisions provide lightweight cross-browser synchronization.
- Admin must eventually operate the product without source-code edits.
- Premium, calm, responsive, accessibility-first UI.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- MongoDB Node.js driver
- MongoDB Atlas
- Google Calendar API / OAuth 2.0
- Google Meet through Calendar `conferenceData`
- Formspree remains planned for contact/form workflows; transactional appointment email beyond Calendar notifications is a later notification phase.

## Architecture

```text
PUBLIC
  /                         therapist profile
  /book                     patient booking
  /appointment/[token]     appointment management
  /appointment/[token]/reschedule

ADMIN
  /admin                    dashboard
  /admin/services           services
  /admin/availability       availability
  /admin/calendar           Google Calendar connection/sync
  /admin/appointments      Phase 11

BOOKING DOMAIN
  lib/booking/
    slot-types.ts
    time-utils.ts
    availability-engine.ts
    conflict-engine.ts
    slot-engine.ts
    booking-engine.ts
    public-availability-service.ts

APPOINTMENT INFRASTRUCTURE
  lib/appointments/
    appointment-types.ts
    appointment-repository.ts
    appointment-service.ts

CALENDAR INFRASTRUCTURE
  lib/calendar/
    calendar-links.ts
    google-calendar-config.ts
    google-calendar-types.ts
    google-calendar-crypto.ts
    google-calendar-repository.ts
    google-calendar-service.ts
    google-calendar-event-service.ts

PERSISTENCE
  MongoDB collections:
    appointments
    appointment_booking_locks
    google_calendar_connections
    google_calendar_busy_cache
    google_calendar_discovered_conflicts
    availability_revisions
```

# Phase status

## Phase 0 — Project foundation

**Complete.**

## Phase 1 — Design system + application shells

**Complete.** Public/admin shells and shared UI foundation exist.

## Phase 2 — Therapist public profile

**Complete.**

Key files:
- `lib/config/therapist-profile.ts`
- `components/public/profile/profile-hero.tsx`
- `components/public/profile/profile-about.tsx`
- `components/public/profile/profile-services-preview.tsx`
- `components/public/profile/profile-how-it-works.tsx`
- `components/public/profile/profile-faq.tsx`
- `app/page.tsx`

## Phase 3 — Services CMS

**Complete.**

Key files:
- `lib/config/services.ts`
- `components/admin/services/services-list.tsx`
- `components/admin/services/service-form.tsx`
- `app/admin/services/page.tsx`

Service model supports name, descriptions, duration, optional price/currency, online/in-person availability, active state, and ordering.

## Phase 4 — Availability management

**Complete.**

Key files:
- `lib/config/availability.ts`
- `components/admin/availability/availability-rules-list.tsx`
- `components/admin/availability/availability-rule-form.tsx`
- `components/admin/availability/availability-exceptions-list.tsx`
- `app/admin/availability/page.tsx`

Core functions include `validateAvailabilityRule`, `validateAvailabilityException`, `isAvailabilityException`, `isFullDayException`, and `isPartialDayException`.

## Phase 5 — Booking engine

**Complete.**

Key files:
- `lib/booking/slot-types.ts`
- `lib/booking/time-utils.ts`
- `lib/booking/availability-engine.ts`
- `lib/booking/conflict-engine.ts`
- `lib/booking/slot-engine.ts`
- `lib/booking/booking-engine.ts`
- `lib/config/booking-settings.ts`

Important functions include `generateBookableSlots`, `filterBookableSlotsByConflicts`, `findBookingConflicts`, `hasBookingConflict`, `calculateAvailabilityWindows`, `expandIntervalForConflictCheck`, and `getBookableSlots`.

Development defaults:
- 24-hour minimum notice
- 60-day maximum advance
- 30-minute slot interval
- 0-minute before buffer
- 10-minute after buffer

## Phase 6 — Patient booking experience

**Complete.**

Key files:
- `app/book/page.tsx`
- `components/public/booking/booking-flow.tsx`
- `components/public/booking/booking-service-picker.tsx`
- `components/public/booking/booking-date-time-picker.tsx`
- `components/public/booking/booking-details-form.tsx`
- `components/public/booking/booking-summary.tsx`
- `components/public/booking/booking-confirmation.tsx`
- `app/api/availability/route.ts`

Flow:

```text
service → timezone → date/time → patient details → review
→ POST /api/appointments → server validation → Mongo transaction
→ confirmation + patient calendar options
```

## Phase 7 — Appointment persistence and management

**Complete and locally validated.**

Key files:
- `lib/appointments/appointment-types.ts`
- `lib/appointments/appointment-repository.ts`
- `lib/appointments/appointment-service.ts`
- `app/api/appointments/route.ts`
- `app/api/appointments/[confirmationToken]/route.ts`
- `app/appointment/[confirmationToken]/page.tsx`
- `components/public/appointments/appointment-management.tsx`
- `lib/db/mongodb.ts`

Important functions:
- `getMongoClient`
- `getMongoDb`
- `ensureAppointmentIndexes`
- `findAppointmentByIdempotencyKey`
- `findAppointmentByToken`
- `findActiveAppointmentsOverlapping`
- `toAppointmentPublicView`
- `cancelAppointment`
- `createAppointment`
- `rescheduleAppointment`

Booking locks use unique 30-minute UTC buckets inside the same MongoDB transaction as the appointment.

## Phase 8 — Patient calendar support

**Complete and locally validated.**

Key files:
- `lib/calendar/calendar-links.ts`
- `app/api/appointments/[confirmationToken]/ics/route.ts`
- `components/public/calendar/calendar-actions.tsx`

Supports Google Calendar, Outlook, Apple Calendar via `.ics`, and generic `.ics` import/download.

## Phase 9 — Therapist Google Calendar integration

**Complete and validated.**

Implemented:
- Google OAuth 2.0 offline access.
- Encrypted refresh-token storage.
- Primary calendar free/busy lookup.
- Manual calendar sync.
- Fail-closed final Google availability validation.
- Calendar disconnect.
- OAuth state protection.
- Temporary admin setup-key protection.
- `calendar.freebusy` + `calendar.events` scopes.

Key files:
- `lib/calendar/google-calendar-config.ts`
- `lib/calendar/google-calendar-types.ts`
- `lib/calendar/google-calendar-crypto.ts`
- `lib/calendar/google-calendar-repository.ts`
- `lib/calendar/google-calendar-service.ts`
- `lib/admin/setup-auth.ts`
- `app/admin/calendar/page.tsx`
- `components/admin/calendar/google-calendar-card.tsx`
- `app/api/admin/google-calendar/unlock/route.ts`
- `app/api/admin/google-calendar/connect/route.ts`
- `app/api/admin/google-calendar/callback/route.ts`
- `app/api/admin/google-calendar/status/route.ts`
- `app/api/admin/google-calendar/disconnect/route.ts`
- `app/api/admin/google-calendar/sync/route.ts`

**Naming rule:** `googleCalendarConnectionId` identifies the Mongo connection record (`"therapist"`). `googleCalendarId` identifies the Google Calendar API calendar (`"primary"`). Never interchange these identifiers.

## Phase 9.1 — Real-time public availability synchronization

**Complete and validated across browsers.**

Architecture:

```text
visible booking page
  ↓ every 3 seconds
GET /api/availability/revision
  ↓ MongoDB only
availability_revisions
  ↓ changed?
POST /api/availability
  ↓ cached Google busy data + Mongo appointments
refresh slots
```

The 3-second loop never calls Google Calendar and pauses when the tab is hidden.

Key persistence:
- `availability_revisions` singleton `_id = "public-booking"`

## Phase 9.2 — Intelligent external-conflict learning

**Complete.**

When a final booking-time Google FreeBusy check discovers a conflict that was not yet present in the cached snapshot:

```text
Google says BUSY
  ↓
google_calendar_discovered_conflicts
  ↓
availability revision bump
  ↓
other browsers remove the slot within the normal sync window
```

Google conflicts intentionally do **not** use `appointment_booking_locks`; those locks represent Grace Sessions booking concurrency, while discovered conflicts represent external calendar facts.

## Phase 10 — Therapist Google Calendar events + Google Meet

**Calendar event lifecycle implemented and locally E2E validated. Google Meet/guest-notification enhancement now implemented; final local validation pending.**

### 10A — Calendar event projection

After Mongo booking commit:
- Create deterministic Google Calendar event.
- Store event ID and sync status.
- Cancellation deletes the event.
- Rescheduling updates the same event.
- MongoDB remains authoritative if Google projection fails.

Key file:
- `lib/calendar/google-calendar-event-service.ts`

Important functions:
- `createGoogleCalendarAppointmentEvent`
- `updateGoogleCalendarAppointmentEvent`
- `deleteGoogleCalendarAppointmentEvent`

### 10B — Google Meet

For online services, Calendar event creation requests:

```text
conferenceData.createRequest
conferenceSolutionKey.type = hangoutsMeet
conferenceDataVersion = 1
```

The service waits briefly for the asynchronously-created video entry point and stores it at:

```text
a ppointment.googleMeet.joinUrl
```

Patients can see `Join Google Meet` from appointment management after the link is available.

### 10C — Calendar guest notifications

Google Calendar is currently the lightweight notification transport instead of adding a separate transactional email provider at this stage.

Event creation/update/deletion uses `sendUpdates: "all"`.

Required guest configuration:
- patient email from the appointment
- therapist email from `GOOGLE_CALENDAR_THERAPIST_EMAIL`

Both are required attendees in the Calendar event. Creation, rescheduling, and cancellation therefore generate Google Calendar email notifications to the participants.

This avoids adding unnecessary email API usage or a paid transactional provider for the core scheduling lifecycle.

**Important:** Formspree is still suitable for contact-form workflows, but it is not the authoritative appointment notification system. Dedicated transactional email remains a later Notifications phase if custom branded emails are required.

### 10D — Appointment rescheduling

Public rescheduling is now implemented.

Key files:
- `app/appointment/[confirmationToken]/reschedule/page.tsx`
- `components/public/appointments/appointment-reschedule.tsx`
- `app/api/appointments/[confirmationToken]/route.ts` (`PATCH`)
- `lib/appointments/appointment-service.ts` (`rescheduleAppointment`)

Rescheduling behavior:
1. Verify the token and future confirmed appointment.
2. Calculate the new end time from the existing service duration.
3. Revalidate MongoDB appointment conflicts.
4. Revalidate Google Calendar conflicts live.
5. Replace booking locks transactionally.
6. Update the appointment in MongoDB.
7. Update the existing Google Calendar event.
8. Preserve the existing Google Meet conference.
9. Send Calendar guest update notifications.
10. Bump the public availability revision so other browsers refresh.

The old slot is not released until the MongoDB transaction succeeds.

### Phase 10 environment

`.env.example` now includes:

```env
GOOGLE_CALENDAR_THERAPIST_EMAIL=
```

This must contain the therapist/doctor email associated with the connected primary Google Calendar.

## Admin shell

Existing admin shell:
- `components/admin/layout/admin-shell.tsx`
- `components/admin/navigation/admin-sidebar.tsx`
- `components/admin/navigation/admin-mobile-nav.tsx`
- `components/admin/navigation/admin-topbar.tsx`
- `components/admin/navigation/admin-breadcrumbs.tsx`
- `lib/config/admin-navigation.ts`

Current admin pages:
- `/admin`
- `/admin/services`
- `/admin/availability`
- `/admin/calendar`

## Phase 11 — Admin appointment management

**Next active phase.**

Goal: make the therapist/admin fully operational without touching source code.

Planned capabilities:
- appointment list
- day/week calendar view
- appointment details
- search/filter
- create appointment manually
- reschedule appointment
- cancel appointment
- mark completed
- mark no-show
- see Google Calendar sync status
- safe conflict validation against MongoDB + Google Calendar
- Google Calendar event projection for admin-created/rescheduled/cancelled appointments

Admin authentication/authorization must be designed together with operational appointment controls. The current setup-key gate is temporary and is not production authentication.

## Phase 12 — Profile CMS

**Planned.**

Move therapist profile content from source configuration into admin-managed persistence/UI so the therapist can change public profile information without code edits.

## Phase 13 — Booking settings CMS

**Planned.**

Admin-manageable:
- minimum notice
- maximum advance
- slot interval
- before/after buffers
- cancellation policy
- booking questions
- booking enabled/disabled state

## Phase 14 — Internationalization

**Planned.**

English, Portuguese, and Hindi across public/admin user-facing copy, with timezone-aware formatting preserved.

## Phase 15 — Notifications

**Planned.**

Custom transactional notification system beyond Google Calendar notifications.

Potential responsibilities:
- branded booking confirmation email
- branded reschedule email
- branded cancellation email
- therapist notification email
- patient reminders
- failure/reconciliation alerts

Formspree may remain the contact-form transport. A dedicated transactional provider should be selected only if custom emails/reminders are actually needed.

## Phase 16 — Security/privacy hardening

**Planned.**

- replace temporary setup authentication with real admin authentication/authorization
- token/rate-limit hardening
- request validation review
- secret/configuration audit
- privacy review
- abuse protection
- logging/error redaction

## Phase 17 — Responsive/accessibility refinement

**Planned.**

Full mobile/desktop review, keyboard navigation, focus states, screen-reader semantics, contrast, loading/empty/error states.

## Phase 18 — Automated testing

**Planned.**

Priority tests:
- booking engine
- timezone/DST boundaries
- concurrent booking locks
- cancellation
- rescheduling
- Google conflict learning
- Google event lifecycle
- Google Meet generation
- API validation
- notification failure handling

## Phase 19 — Production deployment

**Planned.**

Primary target: Vercel + MongoDB Atlas + Google Cloud OAuth production configuration.

Deployment checklist must include:
- production OAuth redirect URI
- production environment secrets
- MongoDB network/access controls
- real admin authentication
- Google OAuth consent configuration
- domain/email configuration
- error monitoring

## Phase 20 — Handover/documentation

**Planned.**

Create a non-technical operating guide so the therapist can run the scheduler like a normal admin application without developer involvement.

# Current source-of-truth rules

1. `main` is the working branch unless explicitly changed.
2. Inspect the latest implementation before modifying existing code.
3. Preserve existing filenames and function names unless an architectural change requires otherwise.
4. Never invent identifier variants. In particular:
   - `googleCalendarConnectionId` = Mongo connection identifier.
   - `googleCalendarId` = Google Calendar API calendar identifier.
5. Keep MongoDB as the authoritative booking state.
6. Keep `appointment_booking_locks` reserved for Grace Sessions concurrency.
7. Keep external Google conflicts in `google_calendar_discovered_conflicts`.
8. Do not poll Google Calendar from the public 3-second revision loop.
9. Update this `PROJECT_MAP.md` whenever architecture or phase status changes.
10. Before calling a phase production-ready, run locally:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
   - `git diff --check`

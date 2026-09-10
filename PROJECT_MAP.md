# Grace Session Scheduler — Project Map

## Purpose

Grace Session Scheduler is a lightweight multilingual appointment scheduling application for a speech-language pathologist. It provides a polished, Calendly-like experience without patient accounts or unnecessary clinical data storage.

## Product decisions

- No patient login.
- Minimal patient data: scheduling details only.
- Manual Google Calendar synchronization for the therapist.
- No cron jobs.
- Google Meet for online appointments.
- MongoDB Atlas persistence.
- Vercel primary deployment; Render/Railway remain practical alternatives.
- English, Portuguese and Hindi from the beginning.
- Appointment timestamps stored in UTC.
- User-facing dates/times are timezone-aware.
- Patients are not required to authorize Google Calendar.
- Patient calendar support will include Google Calendar, Apple Calendar, Outlook and `.ics`.
- Admin must eventually manage content without source-code edits.
- Premium, calm, responsive and accessibility-first UI.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide icons
- MongoDB Node.js driver
- MongoDB Atlas
- Google Calendar / Google Meet later
- Formspree
- Transactional email provider later

## Architecture

```text
Public UI
  ├── therapist profile
  ├── services
  ├── booking
  ├── appointment management
  ├── contact
  └── patient calendar support (later)

Admin UI
  ├── dashboard
  ├── appointments (later)
  ├── calendar (later)
  ├── availability
  ├── services
  ├── profile (later)
  ├── booking settings (later)
  └── settings (later)

Booking domain: lib/booking/
  ├── framework-independent scheduling calculation
  └── infrastructure remains outside the domain

Appointment infrastructure: lib/appointments/ + lib/db/
  ├── persistence
  ├── server-side revalidation
  ├── idempotency
  └── transaction-backed booking locks
```

# Public shell

- `components/public/navigation/public-header.tsx` — sticky header and booking CTA.
- `components/public/navigation/public-nav.tsx` — desktop navigation.
- `components/public/navigation/mobile-nav.tsx` — responsive navigation and booking CTA.
- `components/public/navigation/language-selector.tsx` — English/Portuguese/Hindi foundation.
- `components/public/layout/public-footer.tsx` — public footer.
- `components/ui/page-container.tsx` — shared page width primitive.

# Profile — Phase 2 complete

Configuration:

- `lib/config/therapist-profile.ts`

Components:

- `components/public/profile/profile-hero.tsx`
- `components/public/profile/profile-about.tsx`
- `components/public/profile/profile-services-preview.tsx`
- `components/public/profile/profile-how-it-works.tsx`
- `components/public/profile/profile-faq.tsx`

Homepage composition:

- `app/page.tsx`

# Services — Phase 3 complete

Configuration/model:

- `lib/config/services.ts`

Admin:

- `components/admin/services/services-list.tsx`
- `components/admin/services/service-form.tsx`
- `app/admin/services/page.tsx`

Public:

- `components/public/services/service-card.tsx`

Service model supports name, descriptions, duration, optional price/currency, online/in-person availability, active state and ordering.

# Availability — Phase 4 complete

Configuration/model:

- `lib/config/availability.ts`

Core types:

- `DayOfWeek`
- `AvailabilityRule`
- `AvailabilityExceptionType`
- `AvailabilityException`

Important functions:

- `validateAvailabilityRule`
- `validateAvailabilityException`
- `isAvailabilityException`
- `isFullDayException`
- `isPartialDayException`

Admin:

- `components/admin/availability/availability-rules-list.tsx`
- `components/admin/availability/availability-rule-form.tsx`
- `components/admin/availability/availability-exceptions-list.tsx`
- `app/admin/availability/page.tsx`

# Booking domain — Phase 5 complete

Files:

- `lib/booking/slot-types.ts`
- `lib/booking/time-utils.ts`
- `lib/booking/availability-engine.ts`
- `lib/booking/conflict-engine.ts`
- `lib/booking/slot-engine.ts`
- `lib/booking/booking-engine.ts`
- `lib/config/booking-settings.ts`

Important types:

- `BookingInterval`
- `BookingConflict`
- `BookingWindow`
- `BookingConstraints`
- `SlotGenerationRequest`
- `BookableSlot`
- `SlotGenerationResult`

Important functions:

- `parseTimeToMinutes`
- `formatMinutesToTime`
- `addMinutes`
- `intervalsOverlap`
- `calculateAvailabilityWindows`
- `expandIntervalForConflictCheck`
- `findBookingConflicts`
- `hasBookingConflict`
- `groupBookingConflictsBySource`
- `generateBookableSlots`
- `filterBookableSlotsByConflicts`
- `validateBookingSettings`
- `getBookableSlots`

Current development defaults:

- 24-hour minimum notice
- 60-day maximum advance
- 30-minute slot interval
- 0-minute before buffer
- 10-minute after buffer

Booking calculation:

```text
BookingSlotRequest
  ↓
booking settings
  ↓
availability rules + exceptions
  ↓
availability windows
  ↓
service duration + slot interval
  ↓
minimum notice + maximum advance
  ↓
appointment/calendar conflicts + buffers
  ↓
SlotGenerationResult
```

The domain remains framework-independent. Timezone/DST behavior still needs dedicated automated tests before production.

# Patient booking — Phase 6 + Phase 7

Public booking route:

- `app/book/page.tsx`

Booking UI:

- `components/public/booking/booking-flow.tsx`
- `components/public/booking/booking-service-picker.tsx`
- `components/public/booking/booking-date-time-picker.tsx`
- `components/public/booking/booking-details-form.tsx`
- `components/public/booking/booking-summary.tsx`
- `components/public/booking/booking-confirmation.tsx`

Flow:

```text
/book
  ↓
Choose service
  ↓
Detect/select timezone
  ↓
Choose date/time
  ↓
Enter name + email
  ↓
Review
  ↓
POST /api/appointments
  ↓
Server revalidates slot
  ↓
MongoDB transaction + booking locks
  ↓
Confirmed appointment
  ↓
Management link
```

Phase 6 introduced the public flow and intentionally stopped before persistence. Phase 7 connects the final step to real appointment creation.

# Appointments — Phase 7 complete

Domain types:

- `lib/appointments/appointment-types.ts`
  - `AppointmentStatus`
  - `AppointmentDocument`
  - `AppointmentPublicView`
  - `isAppointmentStatus`

Repository:

- `lib/appointments/appointment-repository.ts`
  - `ensureAppointmentIndexes`
  - `findAppointmentByIdempotencyKey`
  - `findAppointmentByToken`
  - `findActiveAppointmentsOverlapping`
  - `toAppointmentPublicView`
  - `cancelAppointment`

Booking service:

- `lib/appointments/appointment-service.ts`
  - `createAppointment`
  - request validation
  - server-side slot revalidation
  - conflict lookup
  - idempotency
  - transaction-backed booking locks

Database:

- `lib/db/mongodb.ts`
  - `getMongoClient`
  - `getMongoDb`

Collections:

- `appointments`
- `appointment_booking_locks`

Appointment statuses:

```text
confirmed → completed
confirmed → no_show
confirmed → cancelled
```

The public API never trusts client-side availability. The server validates the service, timezone, requested start time, current availability and current appointment conflicts before writing. A unique 30-minute UTC lock bucket is inserted for every interval touched by the appointment inside the same transaction as the appointment document. Cancellation releases those locks transactionally.

API routes:

- `app/api/appointments/route.ts` — `POST` appointment creation.
- `app/api/appointments/[confirmationToken]/route.ts` — `GET` lookup and `DELETE` cancellation.

Patient management:

- `app/appointment/[confirmationToken]/page.tsx`
- `components/public/appointments/appointment-management.tsx`

Only scheduling data is stored. No clinical notes or patient account are introduced.

Environment template:

- `.env.example`

Required variables after setup:

- `MONGODB_URI`
- `MONGODB_DB` (defaults to `grace_sessions`)

# Admin shell

- `components/admin/layout/admin-shell.tsx`
- `components/admin/navigation/admin-sidebar.tsx`
- `components/admin/navigation/admin-mobile-nav.tsx`
- `components/admin/navigation/admin-topbar.tsx`
- `components/admin/navigation/admin-breadcrumbs.tsx`
- `lib/config/admin-navigation.ts`

Current admin pages:

- `app/admin/page.tsx`
- `app/admin/services/page.tsx`
- `app/admin/availability/page.tsx`

Admin appointment CRUD intentionally remains a later phase so authentication/authorization and operational controls can be designed together.

# Shared UI

Existing shadcn/UI foundation includes button, card, badge, alert, checkbox, dialog, dropdown-menu, input, label, select, separator, skeleton, switch, tabs, textarea and `page-container`.

Global states:

- `app/loading.tsx`
- `app/error.tsx`
- `app/not-found.tsx`

# Calendar architecture

Therapist:

- Google Calendar connection.
- Manual synchronization.
- No cron jobs.

Patient:

- Google Calendar link support.
- Apple Calendar support.
- Outlook support.
- `.ics` export.

# Timezone architecture

- Availability rules store explicit IANA timezone identifiers.
- Appointment timestamps are stored in UTC.
- Public booking displays times in the selected/detected patient timezone.
- Browser timezone is detected with manual override.
- DST/timezone edge cases require automated tests before production.

# Privacy architecture

This is a scheduling system, not an electronic health record. Collect only information required for appointment scheduling. Do not ask patients to submit clinical details during booking.

# UI/UX principles

- Premium healthcare/wellness SaaS aesthetic.
- Calm, professional hierarchy.
- Mobile-first responsive design.
- Accessibility-first controls and focus states.
- Clear loading/error/empty states.
- Minimal cognitive load.
- Admin workflows understandable without technical knowledge.

# Development workflow

- Use latest stable JS/TS tooling compatible with the project.
- Preserve established filenames/functions unless there is a compelling architectural reason to change them.
- Inspect latest GitHub implementation before modifying existing files.
- Keep domain logic separate from UI and infrastructure.
- Keep focused descriptive Git commits.
- Run lint, TypeScript, build and diff checks locally before considering a phase production-ready.
- `PROJECT_MAP.md` is the authoritative architecture map.

# Phase roadmap

- Phase 0 — Project foundation — complete
- Phase 1 — Design system + application shells — complete
- Phase 2 — Therapist public profile — complete
- Phase 3 — Services CMS — complete
- Phase 4 — Availability management — complete
- Phase 5 — Booking engine — complete
- Phase 6 — Patient booking experience — complete
- Phase 7 — Appointment management — implemented; local MongoDB validation pending
- Phase 8 — Patient calendar support
- Phase 9 — Google Calendar integration
- Phase 10 — Google Meet
- Phase 11 — Admin appointment management
- Phase 12 — Profile CMS
- Phase 13 — Booking settings CMS
- Phase 14 — Internationalization
- Phase 15 — Notifications
- Phase 16 — Security/privacy hardening
- Phase 17 — Responsive/accessibility refinement
- Phase 18 — Testing
- Phase 19 — Deployment
- Phase 20 — Handover/documentation

# Completion ledger — Phase 7

Status: **Implemented — validation pending**

Created:

- `lib/db/mongodb.ts`
- `lib/appointments/appointment-types.ts`
- `lib/appointments/appointment-repository.ts`
- `lib/appointments/appointment-service.ts`
- `app/api/appointments/route.ts`
- `app/api/appointments/[confirmationToken]/route.ts`
- `components/public/booking/booking-confirmation.tsx`
- `components/public/appointments/appointment-management.tsx`
- `app/appointment/[confirmationToken]/page.tsx`
- `.env.example`
- `docs/PHASE_7.md`

Modified:

- `package.json`
- `components/public/booking/booking-flow.tsx`
- `components/public/booking/booking-summary.tsx`
- `PROJECT_MAP.md`

Important new functions:

- `getMongoClient`
- `getMongoDb`
- `ensureAppointmentIndexes`
- `findAppointmentByIdempotencyKey`
- `findAppointmentByToken`
- `findActiveAppointmentsOverlapping`
- `toAppointmentPublicView`
- `cancelAppointment`
- `createAppointment`

Important new UI components:

- `BookingConfirmation`
- `AppointmentManagement`

Validation limitation:

The GitHub implementation has been reviewed against the current repository source, but this session cannot run the user's local Windows dependency environment or MongoDB Atlas connection. Local validation and database setup are required before Phase 7 is marked production-ready.

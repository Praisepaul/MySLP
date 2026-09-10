# Grace Session Scheduler — Project Map

## Purpose

Grace Session Scheduler is a lightweight multilingual appointment scheduling application for a speech-language pathologist. It is designed to provide a polished, Calendly-like scheduling experience without patient accounts or unnecessary clinical data storage.

## Product decisions

- No patient login.
- Minimal patient data: scheduling details only.
- Manual Google Calendar synchronization for the therapist.
- No cron jobs.
- Google Meet for online appointments.
- MongoDB Atlas as the future persistence layer.
- Vercel primary deployment; Render/Railway remain practical alternatives.
- English, Portuguese and Hindi from the beginning.
- Appointment timestamps stored in UTC.
- User-facing dates/times are timezone-aware.
- Patients are not required to authorize Google Calendar.
- Patient calendar support will include Google Calendar, Apple Calendar, Outlook and `.ics`.
- Admin must eventually manage content without source-code edits.
- Admin UX should be understandable to a non-technical therapist.
- Premium, calm, responsive and accessibility-first UI.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide icons
- Next.js server/API boundaries where practical
- MongoDB Atlas
- Google Calendar / Google Meet
- Formspree
- Transactional email provider later

## Architecture

```text
Public UI
  ├── therapist profile
  ├── services
  ├── booking
  ├── contact
  └── appointment management / calendar support (later)

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
  ├── framework-independent calculation
  └── future API/database/calendar adapters stay outside the domain
```

# Public application

## Existing shell

- `components/public/navigation/public-header.tsx` — sticky public header and booking CTA.
- `components/public/navigation/public-nav.tsx` — desktop navigation.
- `components/public/navigation/mobile-nav.tsx` — responsive mobile navigation and booking CTA.
- `components/public/navigation/language-selector.tsx` — English/Portuguese/Hindi selector foundation.
- `components/public/layout/public-footer.tsx` — public footer.
- `components/ui/page-container.tsx` — shared page width/container primitive.

## Profile

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

The homepage remains a composition layer. Profile content is configuration-driven and is intended to migrate to the CMS/database later without changing public component responsibilities.

# Services — Phase 3 complete

Configuration/model:

- `lib/config/services.ts`

Admin:

- `components/admin/services/services-list.tsx`
- `components/admin/services/service-form.tsx`
- `app/admin/services/page.tsx`

Public:

- `components/public/services/service-card.tsx`

Service model supports name, short/detailed descriptions, duration, optional price/currency, online/in-person availability, active state and display ordering.

# Availability — Phase 4 complete

Model/configuration:

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

Admin UI:

- `components/admin/availability/availability-rules-list.tsx`
- `components/admin/availability/availability-rule-form.tsx`
- `components/admin/availability/availability-exceptions-list.tsx`
- `app/admin/availability/page.tsx`

Availability rules use local `HH:MM` times plus explicit IANA timezones. Exceptions support full-day unavailable and custom-hours overrides. Persistence is intentionally deferred.

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

Current booking baseline configuration:

- 24-hour minimum notice
- 60-day maximum advance
- 30-minute slot interval
- 0-minute before buffer
- 10-minute after buffer

These are configurable development defaults, not final product requirements.

Booking calculation flow:

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

The booking domain is not connected to MongoDB, API routes or Google Calendar yet. Timezone/DST behavior requires dedicated automated tests before production. Booking horizon currently applies to slot start time. Future persisted appointments may require a more explicit buffer policy.

# Patient booking experience — Phase 6 implemented

Public route:

- `app/book/page.tsx`

Booking components:

- `components/public/booking/booking-flow.tsx` — orchestration, timezone detection, upcoming date generation and `getBookableSlots()` integration.
- `components/public/booking/booking-service-picker.tsx` — service selection.
- `components/public/booking/booking-date-time-picker.tsx` — timezone selection, date availability and slot selection.
- `components/public/booking/booking-details-form.tsx` — minimal name/email collection and client validation.
- `components/public/booking/booking-summary.tsx` — appointment review and preview completion.

Documentation:

- `docs/PHASE_6.md`

Patient flow:

```text
/book
  ↓
Choose service
  ↓
Detect/select timezone
  ↓
Choose date
  ↓
Choose available time
  ↓
Enter name + email
  ↓
Review
  ↓
Preview completion
```

Phase 6 deliberately stops before persistent appointment creation. No patient account, MongoDB write, Google OAuth, calendar authorization, email delivery or real appointment creation was introduced.

The public homepage, services section, desktop header and mobile navigation now route their booking CTAs to `/book`.

The booking UI uses the existing Phase 5 domain boundary rather than duplicating scheduling logic. It provides loading, empty, error and responsive states, timezone display/override, keyboard-accessible controls, progress indication and minimal-data guidance.

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

# Shared UI

Existing shadcn/UI foundation includes button, card, badge, alert, checkbox, dialog, dropdown-menu, input, label, select, separator, skeleton, switch, tabs, textarea and the custom `page-container`.

Global UI states:

- `app/loading.tsx`
- `app/error.tsx`
- `app/not-found.tsx`

# API and persistence

No production API/database implementation exists yet.

Future MongoDB collections are expected to include only what is operationally required, such as:

- appointments
- services
- availability rules
- availability exceptions
- admin users
- calendar connections
- application settings

Avoid unnecessary patient collections.

Future API/server boundary should consume the booking domain and perform persistence/conflict revalidation server-side.

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
- Browser timezone should be detected where appropriate, with manual override.
- DST/timezone edge cases must be tested before production.

# Privacy architecture

This is a scheduling system, not an electronic health record. Collect only scheduling information required for the appointment workflow. Do not ask patients to submit clinical details during booking.

# UI/UX principles

- Premium healthcare/wellness SaaS aesthetic.
- Calm, professional visual hierarchy.
- Mobile-first responsive design.
- Accessibility-first controls and focus states.
- Clear loading/error/empty states.
- Minimal cognitive load.
- Admin workflows understandable without technical knowledge.

# Development workflow

- Use latest stable JS/TS tooling compatible with the project.
- Preserve established filenames/functions unless there is a compelling architectural reason to change them.
- Inspect latest GitHub implementation before modifying existing files.
- New feature files may be scaffolded/created directly on GitHub.
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
- Phase 6 — Patient booking experience — complete/implemented
- Phase 7 — Appointment management — next
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

# Completion ledger — Phase 6

Status: **Implemented**

Created:

- `app/book/page.tsx`
- `components/public/booking/booking-flow.tsx`
- `components/public/booking/booking-service-picker.tsx`
- `components/public/booking/booking-date-time-picker.tsx`
- `components/public/booking/booking-details-form.tsx`
- `components/public/booking/booking-summary.tsx`
- `docs/PHASE_6.md`

Modified:

- `app/page.tsx`
- `components/public/navigation/public-header.tsx`
- `components/public/navigation/mobile-nav.tsx`
- `components/public/profile/profile-services-preview.tsx`
- `PROJECT_MAP.md`

Important new UI functions/components:

- `BookingFlow`
- `BookingServicePicker`
- `BookingDateTimePicker`
- `BookingDetailsForm`
- `BookingSummary`
- `getDateParts`
- `getUpcomingDates`
- `Stepper`
- `formatDateLabel`
- `formatSlotTime`

Validation limitation:

The GitHub implementation was reviewed against the current repository APIs, but this session does not have the project's local Node dependency environment. Final local validation should still run:

```text
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Next phase: **Phase 7 — Appointment management**.

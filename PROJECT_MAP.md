# Grace Session Scheduler — Project Map

## Project

Grace Session Scheduler is a lightweight, multilingual appointment scheduling application for a speech-language pathologist serving clients internationally.

The application is designed to replace the core scheduling functionality normally provided by services such as Calendly while keeping infrastructure, cost and operational complexity low.

---

# Core Product Decisions

- No patient login.
- No unnecessary patient data storage.
- Manual Google Calendar sync only.
- No cron jobs.
- Google Meet for all video appointments.
- MongoDB Atlas for the database.
- Vercel is the primary deployment target.
- Render/Railway should remain possible where practical.
- English, Portuguese and Hindi from the beginning.
- Store appointment timestamps in UTC.
- Display dates/times using the appropriate timezone.
- Patients must not be forced to use Google Calendar.
- Patient calendar options should include Google Calendar, Apple Calendar, Outlook and standard `.ics` download.
- The therapist/admin must be able to manage application content without editing source code once the CMS/database layer is complete.
- The admin experience should be simple enough for a non-technical user.
- The application should be UI-rich, responsive and accessible.
- The application should use modern stable JavaScript/TypeScript tooling.

---

# Technology

## Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide icons

## Backend

Next.js server-side functionality/API routes where practical.

No separate backend service unless a future requirement genuinely justifies it.

## Database

MongoDB Atlas.

## External Services

- Google Calendar
- Google Meet
- Formspree
- Transactional email provider

## Deployment

Primary:

- Vercel

Compatible alternatives:

- Render
- Railway

---

# Application Architecture

## Public Application

Responsible for:

- Therapist profile
- Services
- Booking
- Availability display
- Timezone handling
- Contact
- Appointment confirmation
- Appointment management
- Calendar export

## Admin Application

Responsible for:

- Dashboard
- Appointments
- Availability
- Services
- Therapist profile
- Booking settings
- Calendar integration
- Application settings

## API

To be defined during implementation.

## Database

To be defined during implementation.

---

# Public Pages

Implemented/under construction:

- Home — public therapist profile composition

Expected pages include:

- Booking
- Appointment management
- Contact
- Legal/privacy pages as required

---

# Public Profile Architecture

Profile configuration currently lives in:

- `lib/config/therapist-profile.ts`

The configuration is the current single source for therapist-facing profile content while the CMS/database layer is being built. It is intentionally structured so the later Admin → Profile implementation can migrate the same fields into persistent storage without changing the public component API.

Current reusable public profile components:

- `components/public/profile/profile-hero.tsx` — primary therapist/profile introduction and booking CTA.
- `components/public/profile/profile-about.tsx` — therapist introduction and credentials.
- `components/public/profile/profile-services-preview.tsx` — services preview and future CMS entry point.
- `components/public/profile/profile-how-it-works.tsx` — three-step booking journey explanation.
- `components/public/profile/profile-faq.tsx` — public FAQ presentation.

The homepage composition is maintained in `app/page.tsx` and should remain a thin composition layer rather than becoming the home for profile content.

---

# Services Architecture — Phase 3

Phase 3 establishes the initial Services CMS structure.

Files:

- `lib/config/services.ts` — service data/configuration source for the current implementation and later database migration.
- `components/admin/services/services-list.tsx` — admin service list UI.
- `components/admin/services/service-form.tsx` — create/edit service form UI.
- `components/public/services/service-card.tsx` — reusable public service card.
- `app/admin/services/page.tsx` — Services admin page composition.

The service model supports:

- service name
- short description
- detailed description
- duration
- optional price/display information
- online/in-person availability
- active/inactive status
- display ordering

The eventual MongoDB `services` collection should replace configuration data without requiring a redesign of the public component API.

---

# Availability Architecture — Phase 4 Complete

Phase 4 establishes the availability domain model and the first complete admin-facing availability management UI. Persistence is intentionally deferred to the booking/data layer.

## Availability data model

File:

- `lib/config/availability.ts`

Core types:

- `DayOfWeek` — normalized weekday union from Monday through Sunday.
- `AvailabilityRule` — recurring weekly availability window with explicit IANA timezone and active state.
- `AvailabilityExceptionType` — `unavailable` or `custom-hours`.
- `AvailabilityException` — date-specific override/block with optional time window and reason.

Current configuration exports:

- `availabilityRules` — sample Monday-Friday morning/afternoon recurring windows.
- `availabilityExceptions` — initially empty configuration collection.

Validation/helpers:

- `validateAvailabilityRule(rule)` — validates rule id, weekday, HH:MM times, ordering and IANA timezone.
- `validateAvailabilityException(exception)` — validates exception id, real calendar date, exception type and custom-hour time range.
- `isAvailabilityException(exception)` — recognizes supported exception types.
- `isFullDayException(exception)` — identifies full-day unavailable exceptions.
- `isPartialDayException(exception)` — identifies custom-hour exceptions with both times.

Timezones are represented using IANA timezone identifiers. Availability times are local-to-rule values and will be converted into UTC during the future booking calculation process.

## Admin availability components

Files:

- `components/admin/availability/availability-rules-list.tsx` — sorted weekly-rule presentation with active state, timezone and time range.
- `components/admin/availability/availability-rule-form.tsx` — create/edit availability form with client-side validation through `validateAvailabilityRule`.
- `components/admin/availability/availability-exceptions-list.tsx` — date-specific exception presentation for full-day blocks and custom hours.
- `app/admin/availability/page.tsx` — Availability admin page composition.

Important component/functions:

- `AvailabilityRulesList` — presents recurring availability rules in weekday/time order.
- `AvailabilityRuleForm` — manages rule form state and validates submitted rules.
- `getInitialValues` — establishes default/edit form values.
- `createRuleId` — generates a stable local rule identifier for new rules.
- `AvailabilityExceptionsList` — presents sorted availability exceptions.
- `formatDate` / `formatTime` — human-readable admin presentation helpers.
- `getExceptionLabel` — maps exception types to UI labels.
- `AdminAvailabilityPage` — composes weekly availability, rule editor and exceptions sections inside the existing admin shell.

## Phase 4 behavior boundary

The current availability UI is configuration architecture, not persistent CRUD. The Add/Edit controls and form callbacks establish the component API needed for later persistence. MongoDB writes, booking-time calculations and conflict detection belong to later phases.

The future booking engine must combine:

1. active weekly availability rules
2. date-specific availability exceptions
3. service duration
4. appointment buffers
5. minimum booking notice
6. maximum advance booking window
7. existing application appointments
8. Google Calendar conflicts
9. timezone/DST conversion
10. final UTC appointment timestamps

---

# Admin Pages

Implemented/under construction:

- Dashboard
- Services — Phase 3
- Availability — Phase 4

Expected areas include:

- Appointments
- Calendar
- Availability
- Services
- Profile
- Booking settings
- Integrations
- Settings

---

# Database Collections

To be defined during implementation.

Expected collections may include:

- appointments
- services
- availability rules
- availability exceptions
- admin users
- calendar connections
- application settings

Do not create unnecessary patient collections.

---

# Important Functions

## `ProfileHero`

- filename: `components/public/profile/profile-hero.tsx`
- responsibility: Render the primary public therapist introduction, profile image area and booking/learn-more CTAs.

## `ProfileAbout`

- filename: `components/public/profile/profile-about.tsx`
- responsibility: Render the therapist introduction and optional credentials.

## `ProfileServicesPreview`

- filename: `components/public/profile/profile-services-preview.tsx`
- responsibility: Present the public services section and future service CMS entry point.

## `ProfileHowItWorks`

- filename: `components/public/profile/profile-how-it-works.tsx`
- responsibility: Explain the three-step public booking journey.

## `ProfileFaq`

- filename: `components/public/profile/profile-faq.tsx`
- responsibility: Render the public FAQ section.

## `ServicesList`

- filename: `components/admin/services/services-list.tsx`
- responsibility: Render the admin-facing collection of services with management actions.

## `ServiceForm`

- filename: `components/admin/services/service-form.tsx`
- responsibility: Provide the admin create/edit interface for service data.

## `ServiceCard`

- filename: `components/public/services/service-card.tsx`
- responsibility: Render one reusable public-facing service presentation.

## `AvailabilityRulesList`

- filename: `components/admin/availability/availability-rules-list.tsx`
- responsibility: Render recurring availability rules sorted by weekday and start time.

## `AvailabilityRuleForm`

- filename: `components/admin/availability/availability-rule-form.tsx`
- responsibility: Provide the admin create/edit interface for recurring availability rules.
- validation: delegates domain validation to `validateAvailabilityRule`.

## `AvailabilityExceptionsList`

- filename: `components/admin/availability/availability-exceptions-list.tsx`
- responsibility: Render date-specific unavailable and custom-hours exceptions.

## `AdminAvailabilityPage`

- filename: `app/admin/availability/page.tsx`
- responsibility: Compose the Availability admin experience using the existing `AdminShell`, shared UI primitives and availability configuration.

---

# Important Components

Existing application-shell components remain under:

- `components/public/navigation/`
- `components/public/layout/`
- `components/admin/navigation/`
- `components/admin/layout/`
- `components/ui/`

Availability components remain under:

- `components/admin/availability/`

This keeps domain-specific admin UI grouped by feature while shared primitives remain reusable.

---

# API Routes

To be documented as implementation progresses.

---

# Environment Variables

To be documented as implementation progresses.

Never commit secrets or credentials.

---

# Internationalization

Supported languages:

- English
- Portuguese
- Hindi

Internationalization should be implemented from the beginning rather than added after the application is complete.

---

# Timezone Architecture

Internal appointment timestamps:

UTC.

User-facing dates and times:

Timezone-aware.

Therapist availability:

Stored with an explicit IANA timezone.

Patient booking:

Use the patient's detected browser timezone where appropriate, while allowing manual timezone selection.

---

# Calendar Architecture

## Therapist

Google Calendar integration.

Synchronization is manual.

No cron jobs.

## Patient

Patients are not required to authorize Google Calendar.

Supported calendar options:

- Google Calendar
- Apple Calendar
- Outlook
- `.ics`

---

# Video

Google Meet is the video platform for online appointments.

No additional video provider is planned for the initial version.

---

# Privacy

The application is a scheduling system, not an electronic health record.

Only information necessary for scheduling and appointment management should be collected.

Avoid collecting unnecessary clinical or personally sensitive information.

---

# UI/UX Principles

- Premium healthcare/wellness SaaS aesthetic.
- Mobile-first.
- Responsive.
- Accessible.
- Calm and professional.
- Rich visual hierarchy.
- Subtle animations.
- Clear loading/error/empty states.
- Minimal cognitive load.
- Admin actions should be understandable without technical knowledge.

---

# Development Workflow

- Use TypeScript.
- Use modern stable JavaScript/TypeScript tooling.
- Preserve established filenames and function names unless there is a compelling architectural reason to change them.
- Avoid unnecessary rewrites.
- Reuse existing components where appropriate.
- Document significant architectural changes in this file.
- Keep Git commits focused and descriptive.
- Do not introduce infrastructure without a clear requirement.
- New feature files may be scaffolded directly on GitHub; implementation code is normally added and committed locally by the developer.
- `PROJECT_MAP.md` is maintained as the authoritative architecture/change map.
- Before proposing implementation changes, inspect the latest GitHub version of affected files.

---

# Phase Roadmap

- Phase 0 — Project foundation — complete
- Phase 1 — Design system + application shells — complete
- Phase 2 — Therapist public profile — complete
- Phase 3 — Services CMS — complete
- Phase 4 — Availability management — complete
- Phase 5 — Booking engine — next
- Phase 6 — Patient booking experience
- Phase 7 — Appointment management
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

---

# Change Log

## Initial Project

- Next.js project initialized.
- Core product decisions documented.
- Git repository initialized.

## Phase 2 — Therapist Public Profile

- Added `lib/config/therapist-profile.ts` as the initial profile content model.
- Added reusable public profile components under `components/public/profile/`.
- Composed the homepage from the new profile sections.
- Kept `app/page.tsx` as a composition layer.
- Optimized the profile hero image implementation with Next.js `Image`.
- Refined the public services preview into a three-card presentation.

## Phase 3 — Services CMS

- Created the Services configuration/model.
- Added admin service list and create/edit form components.
- Added reusable public `ServiceCard`.
- Added `app/admin/services/page.tsx`.
- Documented the intended migration from configuration data to MongoDB.

## Phase 4 — Availability Management

- Added recurring weekly availability and date-specific exception models in `lib/config/availability.ts`.
- Added domain validation for availability rules, IANA timezones, exception dates and custom-hour ranges.
- Added `AvailabilityRulesList` for recurring schedule presentation.
- Added `AvailabilityRuleForm` for create/edit rule UI.
- Added `AvailabilityExceptionsList` for full-day and custom-hour exceptions.
- Added `app/admin/availability/page.tsx` as the Availability admin composition layer.
- Kept persistence intentionally deferred to the future data/booking layer.
- Established the booking-engine inputs and timezone boundary for Phase 5.

---

# Phase 4 Completion Ledger

Status: **Complete**

Created/added during Phase 4:

- `lib/config/availability.ts`
- `components/admin/availability/availability-rules-list.tsx`
- `components/admin/availability/availability-rule-form.tsx`
- `components/admin/availability/availability-exceptions-list.tsx`
- `app/admin/availability/page.tsx`

Key domain functions/components:

- `validateAvailabilityRule`
- `validateAvailabilityException`
- `isAvailabilityException`
- `isFullDayException`
- `isPartialDayException`
- `AvailabilityRulesList`
- `AvailabilityRuleForm`
- `AvailabilityExceptionsList`
- `AdminAvailabilityPage`

Validation expected for the completed phase:

```text
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Next phase: **Phase 5 — Booking Engine**.

# Grace Session Scheduler — Project Map

## Project

Grace Session Scheduler is a lightweight, multilingual appointment scheduling
application for a speech-language pathologist serving clients internationally.

The application is designed to replace the core scheduling functionality
normally provided by services such as Calendly while keeping infrastructure,
cost and operational complexity low.

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
- Patient calendar options should include:
  - Google Calendar
  - Apple Calendar
  - Outlook
  - Standard `.ics` download
- The therapist/admin must be able to manage application content without
  editing source code.
- The admin experience should be simple enough for a non-technical user.
- The application should be UI-rich, responsive and accessible.
- The application should use modern stable JavaScript/TypeScript tooling.

---

# Technology

## Frontend

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui

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

The configuration is the current single source for therapist-facing profile
content while the CMS/database layer is being built. It is intentionally
structured so the later Admin → Profile implementation can migrate the same
fields into persistent storage without changing the public component API.

Current reusable public profile components:

- `components/public/profile/profile-hero.tsx` — primary therapist/profile
  introduction and booking CTA.
- `components/public/profile/profile-about.tsx` — therapist introduction and
  credentials.
- `components/public/profile/profile-services-preview.tsx` — services preview
  and future CMS entry point.
- `components/public/profile/profile-how-it-works.tsx` — three-step booking
  journey explanation.
- `components/public/profile/profile-faq.tsx` — public FAQ presentation.

The homepage composition is maintained in `app/page.tsx` and should remain a
thin composition layer rather than becoming the home for profile content.

---

# Services Architecture

Phase 3 establishes the initial Services CMS structure.

Scaffolded files:

- `lib/config/services.ts` — service data/configuration source for the current
  implementation and later database migration.
- `components/admin/services/services-list.tsx` — admin service list UI.
- `components/admin/services/service-form.tsx` — create/edit service form UI.
- `components/public/services/service-card.tsx` — reusable public service card.
- `app/admin/services/page.tsx` — Services admin page composition.

These files are intentionally scaffolded before implementation so the local
code remains under the developer's control. The implementation code for each
file is added locally and committed from the developer's machine.

The intended service model will support, at minimum:

- service name
- short description
- detailed description
- duration
- optional price/display information
- online/in-person availability
- active/inactive status
- display ordering

The eventual MongoDB `services` collection should replace configuration data
without requiring a redesign of the public component API.

---

# Admin Pages

Implemented/under construction:

- Dashboard
- Services — Phase 3 scaffold

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
- responsibility: Render the primary public therapist introduction, profile
  image area and booking/learn-more CTAs.
- important dependencies: `therapistProfile`, Next.js `Link`, Lucide icons,
  Next.js `Image`.

## `ProfileAbout`

- filename: `components/public/profile/profile-about.tsx`
- responsibility: Render the therapist introduction and optional credentials.
- important dependencies: `therapistProfile`, Lucide icons.

## `ProfileServicesPreview`

- filename: `components/public/profile/profile-services-preview.tsx`
- responsibility: Present the public services section and future service CMS
  entry point.
- important dependencies: Next.js `Link`, Lucide icons,
  `therapistProfile`.

## `ProfileHowItWorks`

- filename: `components/public/profile/profile-how-it-works.tsx`
- responsibility: Explain the three-step public booking journey.
- important dependencies: Lucide icons.

## `ProfileFaq`

- filename: `components/public/profile/profile-faq.tsx`
- responsibility: Render the public FAQ section.
- important dependencies: shadcn `Card` components.

## `ServicesList`

- filename: `components/admin/services/services-list.tsx`
- responsibility: Render the admin-facing collection of services with actions
  for managing service records.
- status: Scaffolded in Phase 3; implementation is added locally.

## `ServiceForm`

- filename: `components/admin/services/service-form.tsx`
- responsibility: Provide the admin create/edit interface for service data.
- status: Scaffolded in Phase 3; implementation is added locally.

## `ServiceCard`

- filename: `components/public/services/service-card.tsx`
- responsibility: Render one reusable public-facing service presentation.
- status: Scaffolded in Phase 3; implementation is added locally.

---

# Important Components

See `# Public Profile Architecture` and `# Services Architecture` above for
current public and Services component inventories.

Existing application-shell components remain under:

- `components/public/navigation/`
- `components/public/layout/`
- `components/admin/navigation/`
- `components/admin/layout/`
- `components/ui/`

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

Internationalization should be implemented from the beginning rather than
added after the application is complete.

---

# Timezone Architecture

Internal appointment timestamps:

UTC.

User-facing dates and times:

Timezone-aware.

Therapist availability:

Stored with an explicit IANA timezone.

Patient booking:

Use the patient's detected browser timezone where appropriate, while allowing
manual timezone selection.

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

Only information necessary for scheduling and appointment management should
be collected.

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

# Development Rules

- Use TypeScript.
- Use modern stable JavaScript/TypeScript tooling.
- Preserve established filenames and function names unless there is a
  compelling architectural reason to change them.
- Avoid unnecessary rewrites.
- Reuse existing components where appropriate.
- Document significant architectural changes.
- Update this file when architecture changes.
- Keep Git commits focused and descriptive.
- Do not introduce infrastructure without a clear requirement.
- GitHub may be used to scaffold empty files and maintain the architecture map,
  but implementation code is added and committed locally by the developer
  unless explicitly requested otherwise.

---

# Change Log

## Initial Project

- Next.js project initialized.
- Core product decisions documented.
- Git repository initialized.

## Phase 2A — Therapist Public Profile Foundation

- Added `lib/config/therapist-profile.ts` as the initial profile content model.
- Added reusable public profile components under
  `components/public/profile/`.
- Composed the homepage from the new profile sections.
- Kept `app/page.tsx` as a composition layer.
- Established the public profile component inventory for the future Profile CMS.

## Phase 2 Polish — Public Profile Refinement

- Optimized the profile hero image implementation with Next.js `Image`.
- Refined the public services preview into a three-card presentation.
- Preserved existing public component filenames and functions.

## Phase 3A — Services CMS Scaffold

- Created empty implementation files for the Services admin/public structure.
- Added the Services architecture and intended service model to this map.
- Implementation code is intentionally being added locally by the developer.

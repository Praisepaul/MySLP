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

To be implemented.

Expected pages include:

- Home
- Booking
- Appointment management
- Contact
- Legal/privacy pages as required

---

# Admin Pages

To be implemented.

Expected areas include:

- Dashboard
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

To be documented as implementation progresses.

Every significant shared function should be recorded here with:

- filename
- function name
- responsibility
- important dependencies

---

# Important Components

To be documented as implementation progresses.

Every significant reusable component should be recorded here with:

- filename
- component name
- responsibility
- important dependencies

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

---

# Change Log

## Initial Project

- Next.js project initialized.
- Core product decisions documented.
- Git repository initialized.
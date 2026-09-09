# Grace Session Scheduler — Project Map

## Project

MySLP is a lightweight, multilingual appointment scheduling
application for a speech-language pathologist serving clients internationally.

## Core Product Decisions

- No patient login
- Minimal patient data storage
- Manual Google Calendar sync
- No cron jobs
- Google Meet for online appointments
- MongoDB Atlas
- Vercel / Render / Railway compatible
- English, Portuguese and Hindi from the beginning
- UTC storage with timezone-aware display
- Patient calendar support must not require Google Calendar
- Patient calendar options include Google Calendar, Apple Calendar, Outlook
  and standard `.ics` download
- Sister/admin must be able to manage application content without code changes

## Technology

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- ESLint
- MongoDB Atlas
- Git

## Architecture

### Public Application

To be defined during implementation.

### Admin Application

To be defined during implementation.

### API

To be defined during implementation.

### Database

To be defined during implementation.

### Integrations

- Google Calendar
- Google Meet
- Formspree
- Transactional email provider

## Important Functions

To be documented as implementation progresses.

## Important Components

To be documented as implementation progresses.

## Database Collections

To be documented as implementation progresses.

## Environment Variables

To be documented as implementation progresses.

## Change Log

### Initial

- Project initialized.
- Git repository initialized.
- Core product decisions recorded.
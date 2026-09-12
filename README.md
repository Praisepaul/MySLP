# Ephatha

> Production-oriented scheduling and practice-management software for a therapist-led private practice.

Ephatha combines a public booking experience, protected administration, persisted CMS configuration, concurrency-safe appointment booking, Google Calendar/Google Meet integration, passkey authentication, and MongoDB-driven realtime synchronization.

## Architecture in one sentence

**MongoDB owns application state; Google Calendar supplies external calendar availability and receives event projections.**

This boundary is deliberate: appointments, booking locks, persisted configuration, CMS content, and realtime revisions remain authoritative in MongoDB. Google failures therefore do not erase application appointments, and public realtime refreshes never poll Google Calendar.

## Highlights

- Public service → date/time → client details → review → confirmation booking flow.
- Browser timezone-aware scheduling with persisted therapist availability and booking configuration.
- MongoDB booking locks and server-side conflict validation for concurrent bookings.
- Appointment cancellation, rescheduling, confirmation links, and ICS export.
- Protected admin workspace for appointments, services, availability, profile, booking settings, and calendar integration.
- Google Calendar OAuth, free/busy integration, event projection, and Google Meet for online appointments.
- Encrypted Google OAuth refresh credentials.
- Hardened signed admin sessions plus WebAuthn/passkey authentication.
- Public/admin route isolation and server-side authorization.
- MongoDB revision polling (~3 seconds while relevant UI is active) instead of Google polling for realtime UX.
- Light / dark / system theme preference stored only in browser local storage.
- Public Privacy, Terms, Cookie, and Data Deletion documentation.
- Vercel + MongoDB Atlas production architecture.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui / Base UI primitives
- MongoDB driver 7 / MongoDB Atlas
- Google Calendar API + OAuth
- Google Meet through Calendar conference data
- SimpleWebAuthn browser/server
- Vercel

## Architecture at a glance

```text
 Browser
    │ HTTPS
    ▼
┌───────────────┐
│    Next.js    │─────── Google Calendar / Meet
│ App + APIs    │        external schedule + projection
└───────┬───────┘
        │ authoritative application state
        ▼
┌────────────────┐
│ MongoDB Atlas  │
│ appointments   │
│ booking locks  │
│ CMS/settings   │
│ revisions      │
│ admin state    │
└────────────────┘
```

## Repository map

```text
app/                  Next.js pages, layouts and API routes
components/           Public/admin/shared UI
lib/appointments/     Appointment repository, service and types
lib/booking/          Availability, conflicts, slots and booking engine
lib/calendar/         Google Calendar configuration, repository and services
lib/cms/              Persisted profile, services and availability
lib/config/           Booking configuration boundary
lib/db/               MongoDB connection boundary
lib/admin/            Admin authentication and passkeys
lib/ui/               Client synchronization helpers
scripts/              Local operational scripts
docs/                 Engineering and operational documentation
PROJECT_MAP.md        Living implementation/architecture source of truth
```

## Local development

### Prerequisites

- Node.js compatible with the pinned Next.js release
- npm
- MongoDB Atlas or compatible MongoDB deployment
- Google Cloud OAuth credentials when Calendar integration is needed

### Setup

```bash
git clone https://github.com/Praisepaul/Ephatha.git
cd Ephatha
npm install
cp .env.example .env.local
npm run admin:hash-password
npm run dev
```

Open `http://localhost:3000`.

Never commit `.env.local` or production secrets.

## Commands

```bash
npm run dev                 # local development
npm run lint                # ESLint
npm run build               # production build validation
npm run start               # serve a production build
npm run admin:hash-password # generate an admin password hash
```

The project intentionally has no current CI/browser test suite; Playwright, temporary regression tests, and CI configuration were removed by project-owner decision. Production-sensitive changes require lint/build plus relevant manual lifecycle validation.

## Environment

Copy `.env.example` to `.env.local`. The full environment contract is documented in [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

Main groups:

- `MONGODB_URI`, `MONGODB_DB`
- `GOOGLE_CALENDAR_*`
- `GRACE_ADMIN_USERNAME`, `GRACE_ADMIN_PASSWORD_HASH`, `GRACE_ADMIN_SESSION_SECRET`
- `GRACE_ADMIN_ORIGIN`, `GRACE_ADMIN_RP_ID`

Secrets are server-only. Never place credentials or encryption/session keys in `NEXT_PUBLIC_*` variables.

## Security model

Ephatha enforces authorization server-side and treats browser UI as untrusted presentation. Controls include signed HttpOnly Secure `__Host-` cookies, credential-version-bound sessions, scrypt password hashing, MongoDB-backed login rate limiting without raw IP storage, WebAuthn challenges, signed single-use Google OAuth state, AES-256-GCM encrypted Calendar refresh credentials, private/no-store appointment capability responses, and security headers.

See [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/SECURITY_AUDIT_16C.md`](docs/SECURITY_AUDIT_16C.md).

## Realtime design

Two singleton MongoDB revision documents drive client refresh behavior:

- `availability_revisions` — public booking availability.
- `appointment_revisions` — admin appointment workspace.

The browser checks these revisions about every three seconds while the relevant UI is active. A revision change triggers a fresh application-data read. This avoids continuous Google API polling and keeps external API usage predictable.

## MongoDB resilience

`lib/db/mongodb.ts` is the single MongoDB connection boundary. It lazily creates and caches a client per warm serverless execution context, clears failed initial connection promises, and uses bounded pool/timeout/retry settings suitable for the Vercel + Atlas deployment model. There is intentionally no application-level retry loop that could amplify database pressure.

## Production

Current production architecture:

**Vercel → Next.js → MongoDB Atlas + Google Cloud OAuth/Calendar**

Production URL: `https://myslp-delta.vercel.app/`

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for deployment, OAuth redirect URIs, environment setup, smoke checks, rollback, and operational guidance.

## Documentation

| Document | Purpose |
|---|---|
| [`PROJECT_MAP.md`](PROJECT_MAP.md) | Authoritative implementation and architecture map |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local development and change workflow |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) | Environment variable contract |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production deployment and rollback |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security architecture and invariants |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | MongoDB state and collection model |
| [`docs/API.md`](docs/API.md) | API surface and contracts |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | Runbooks and incident response |
| [`docs/HANDOVER.md`](docs/HANDOVER.md) | Maintainer handover and change discipline |
| [`docs/SECURITY_AUDIT_16C.md`](docs/SECURITY_AUDIT_16C.md) | Existing security audit record |

## Engineering rules

1. `main` is the source of truth.
2. Inspect the latest `main` before every change.
3. Reuse existing filenames, functions, types, repositories, services, and booking logic.
4. Do not create parallel scheduling implementations or `-v2` replacements.
5. MongoDB is authoritative for application booking state.
6. Google Calendar is an integration boundary, not the booking database.
7. Public realtime loops never poll Google Calendar.
8. Sensitive admin APIs authenticate server-side.
9. Secrets never enter source control.
10. Update `PROJECT_MAP.md` whenever architecture, filenames, functions, collections, security controls, environment rules, or phase status change.

## Project status

The core public booking, CMS, admin, calendar, security, legal, responsive, theme, and MongoDB resilience architecture is implemented. The project is currently progressing through **Phase 11 — Admin Appointment Management**, with production deployment and final handover treated as ongoing operational milestones.

## Ownership / license

No open-source license is currently declared. The repository may be publicly viewable, but that does not grant permission to reuse production branding, clinical content, configuration, or proprietary implementation.

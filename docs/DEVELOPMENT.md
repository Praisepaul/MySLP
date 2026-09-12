# Development Guide

## Source of truth

`main` is the source of truth. Before changing anything, inspect the latest `main` and use the existing filenames, functions, types, repositories and services. Do not build parallel scheduling logic.

## Setup

```bash
git clone https://github.com/Praisepaul/Ephatha.git
cd Ephatha
npm install
cp .env.example .env.local
```

Configure MongoDB first. Configure Google OAuth when Calendar integration is required. Generate the admin password hash with:

```bash
npm run admin:hash-password
```

Start development:

```bash
npm run dev
```

## Available commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run admin:hash-password
```

## Change workflow

1. Inspect latest `main`.
2. Identify the existing boundary that owns the behavior.
3. Make the smallest coherent change.
4. Preserve public/admin isolation and MongoDB source-of-truth rules.
5. Update `PROJECT_MAP.md` when architecture changes.
6. Run lint and build.
7. Manually test the affected lifecycle.
8. Use a feature branch and PR for normal changes; direct `main` changes require explicit authorization.

## Manual validation checklist

### Booking
- service selection
- date/time selection
- browser timezone
- stale slot rejection
- duplicate/idempotent submission
- successful appointment creation
- confirmation page
- cancellation
- rescheduling
- ICS export

### Admin
- unauthenticated redirect
- login/logout
- password rotation
- passkey registration/login
- appointments workspace
- availability/settings/services/profile changes
- Calendar connect/disconnect

### Google Calendar
- OAuth state validation
- free/busy availability
- event creation/update/deletion
- Google Meet for online appointments
- participant notifications
- Google failure does not delete Mongo appointment state

### UI
- mobile navigation
- keyboard navigation
- 44px touch targets
- light/dark/system themes
- theme persistence and system preference changes

## Testing policy

The repository currently has no CI/browser test suite. This is intentional: prior Playwright, temporary regression tests and CI configuration were removed by project-owner decision. Do not silently reintroduce them.

Lint/build are necessary checks, but not substitutes for manual lifecycle validation of security- and booking-sensitive changes.

## Code conventions

Prefer small named domain functions over route-level business logic. Keep database access in repositories, lifecycle orchestration in services, and UI state in components/hooks. Preserve TypeScript types at boundaries. Never log credentials, OAuth refresh tokens, session cookies, appointment bearer tokens or other secrets.

## Documentation rule

If a change adds/removes a route, function, collection, environment variable, security invariant, integration, or phase milestone, update `PROJECT_MAP.md` in the same workstream.

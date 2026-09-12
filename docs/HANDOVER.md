# Maintainer Handover

## Source of truth

- Repository: `Praisepaul/Ephatha`
- Production branch: `main`
- Current hosting: Vercel
- Database: MongoDB Atlas
- External calendar: Google Calendar/Meet

## Before changing code

1. Fetch/inspect the latest `main`.
2. Read `PROJECT_MAP.md`.
3. Locate the existing owner of the behavior.
4. Reuse the existing function/repository/service/type boundary.
5. Check whether the change affects security, data, environment variables, or external integrations.

## Critical files

- `lib/db/mongodb.ts` — MongoDB connection boundary.
- `lib/booking/*` — scheduling/slot/conflict/booking domain.
- `lib/appointments/*` — appointment persistence and lifecycle.
- `lib/calendar/*` — Google Calendar integration.
- `lib/admin/auth.ts` — admin authentication/session.
- `lib/admin/passkeys.ts` — WebAuthn/passkeys.
- `lib/cms/*` — persisted profile/services/availability.
- `lib/ui/use-data-sync.ts` — revision-driven client synchronization.
- `components/public/booking/booking-flow.tsx` — public booking orchestration.
- `components/theme/*` — theme architecture.
- `PROJECT_MAP.md` — authoritative architecture/progress map.

## Never break these invariants

- MongoDB is the application source of truth.
- Booking concurrency uses the existing lock architecture.
- Client availability is never trusted at booking time.
- Google Calendar is not the appointment database.
- Public realtime polling does not call Google.
- Sensitive admin APIs authenticate server-side.
- Appointment bearer-token responses remain private/no-store.
- Passkey ceremonies use pinned production origin/RP ID.
- Secrets remain server-side.

## Documentation maintenance

Update `PROJECT_MAP.md` and the relevant document in `docs/` when adding/removing routes, collections, environment variables, integrations, security controls, or architectural boundaries.

## Testing expectation

The project currently has no CI/browser suite. Run `npm run lint` and `npm run build`, then perform manual lifecycle checks appropriate to the change. Do not claim full production readiness from static checks alone.

## Handover mindset

Prefer boring, explicit changes over clever rewrites. Preserve established boundaries, keep external integrations recoverable, and document decisions while they are still fresh.

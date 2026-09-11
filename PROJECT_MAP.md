# Ephatha — Project Map

> **Authoritative architecture/progress map.** `main` is the source of truth. Update this file whenever phases, architecture, filenames, functions, collections, security controls, tests, or environment rules change.

## Product / trust model
- MongoDB is authoritative for Ephatha appointments, booking state, persisted CMS settings, and realtime revisions.
- `appointment_booking_locks` protects booking concurrency. Never bypass booking validation or locks.
- Google Calendar is the external therapist-calendar/free/busy signal and event projection; MongoDB remains authoritative if Google reconciliation fails.
- `googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google API calendar identifier (`primary`). Never mix them.
- Online appointments request Google Meet through Calendar `conferenceData`.
- Calendar create/update/delete uses `sendUpdates: all`.
- Public availability synchronization is Mongo-revision driven; the 3-second loop never polls Google.
- Public and admin surfaces are isolated. Public routes never depend on admin authentication. Every admin page is protected by the admin layout and every sensitive admin API authenticates server-side.
- No patient accounts, clinical notes, therapist self-registration, or separate notification provider. Product is English-only.
- Time display uses `HH:mm`; timezone values are runtime IANA values via `components/ui/timezone-select.tsx`.

## Technology
Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MongoDB driver/Atlas, Google Calendar API/OAuth, Google Meet, SimpleWebAuthn browser/server.

## Routes
### Public
- `/`
- `/book`
- `/appointment/[confirmationToken]`
- `/appointment/[confirmationToken]/reschedule`
- `/privacy-policy` — public Privacy Policy; includes Google user-data, retention, deletion, rights, security, and international-transfer disclosures.
- `/terms` — public Terms of Service.
- `/cookie-policy` — public Cookie Policy.
- `/data-deletion` — public personal-data deletion instructions.
- `/api/profile/image`
- `/api/appointments/[confirmationToken]` — bearer capability; private/no-store
- `/api/appointments/[confirmationToken]/ics` — bearer capability; private/no-store
- `/api/availability` and `/api/availability/revision`
- `/api/appointments/revision`

### Private admin
- `/admin`
- `/admin/services`
- `/admin/availability`
- `/admin/calendar`
- `/admin/appointments`
- `/admin/profile`
- `/admin/profile/preview`
- `/admin/booking-settings`
- `/admin-login`

## Authentication
### `lib/admin/auth.ts`
Key functions: `isAdminAuthConfigured`, `isAdminAuthenticated`, `requireAdminSession`, `loginAdmin`, `logoutAdmin`, `establishAdminSession`, `hashAdminPassword`, `verifyAdminPassword`, `changeAdminPassword` plus `AdminAuthenticationError` and `AdminAuthenticationConfigurationError`.

Controls:
- Signed HttpOnly `__Host-grace_admin_session`; Secure, SameSite=Lax, Path=/, 8h lifetime, no Domain.
- Credential-version binding invalidates old sessions after password-hash rotation.
- Password changes require 15–128 characters; new hashes use scrypt `N=32768,r=8,p=2`, 64-byte output, 16-byte salt. Legacy hashes remain verifiable.
- Failed login attempts use short-lived MongoDB rate-limit records; raw IP is not stored.

### Passkeys — `lib/admin/passkeys.ts`
Functions: `beginAdminPasskeyRegistration`, `finishAdminPasskeyRegistration`, `beginAdminPasskeyAuthentication`, `finishAdminPasskeyAuthentication`, `getAdminPasskeyStatus`, `getPasskeyUserLabel`.

Routes:
- `app/api/admin/auth/passkey/register/options/route.ts`
- `app/api/admin/auth/passkey/register/verify/route.ts`
- `app/api/admin/auth/passkey/login/options/route.ts`
- `app/api/admin/auth/passkey/login/verify/route.ts`
- `app/api/admin/auth/passkey/status/route.ts`

Controls: discoverable credentials, required user verification, server-side one-time challenges, signed `__Host-grace_admin_passkey_challenge`, 5-minute challenge lifetime, Mongo TTL, unique credential IDs, authenticator-counter optimistic concurrency. Production RP/origin are pinned by `GRACE_ADMIN_RP_ID` and `GRACE_ADMIN_ORIGIN`; production fails closed if missing.

### Google OAuth — `lib/admin/setup-auth.ts`
Functions: `isGoogleCalendarConfigured`, `createGoogleCalendarOAuthState`, `consumeGoogleCalendarOAuthState`. OAuth state is signed, random, 10-minute, single-use and bound to `__Host-grace_google_calendar_oauth_state`.

## CMS
- `lib/cms/site-settings-repository.ts`: therapist profile draft/publish and booking settings persistence.
- `lib/cms/services-repository.ts`: persisted services.
- `lib/cms/availability-repository.ts`: persisted availability.
- Profile UI: `components/admin/profile/profile-form.tsx`, `profile-content-fields.tsx`; public profile components under `components/public/profile/`.
- Admin profile APIs: `app/api/admin/profile/route.ts`, `app/api/admin/profile/image/route.ts`; public image API: `app/api/profile/image/route.ts`.
- Mongo `site_settings`, `cms_services`, `cms_availability`, GridFS `profile_media.files/chunks`.
- Drafts are private; publishing is explicit; empty public profile sections stay hidden.

## Booking / appointments
### Booking modules
`lib/booking/time-utils.ts`, `availability-engine.ts`, `conflict-engine.ts`, `slot-engine.ts`, `booking-engine.ts`, `public-availability-service.ts`, `slot-types.ts`, `lib/config/booking-settings.ts`.

`getBookableSlotsWithConfiguration()` is the runtime persisted-config boundary; `getBookableSlots()` remains compatibility/default fallback.

### Appointments
`lib/appointments/appointment-types.ts`, `appointment-repository.ts`, `appointment-service.ts`.
Repository functions include `ensureAppointmentIndexes`, `findAppointmentByIdempotencyKey`, `findAppointmentByToken`, `findActiveAppointmentsOverlapping`, `findAdminAppointments`, `toAppointmentPublicView`, `cancelAppointment`, `updateAppointmentStatus`, `updateAppointmentSchedule`, `updateGoogleCalendarSyncStatus`.
Service functions: `createAppointment`, `rescheduleAppointment`, `cancelAppointment`; error type `AppointmentBookingError`.

## Google Calendar
Modules: `lib/calendar/google-calendar-config.ts`, `google-calendar-types.ts`, `google-calendar-crypto.ts`, `google-calendar-repository.ts`, `google-calendar-service.ts`, `google-calendar-event-service.ts`.
- Refresh tokens are encrypted with AES-256-GCM using `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`.
- Admin Calendar routes require `requireAdminSession()`.
- Calendar failure never makes Mongo appointment state disappear.
- Current OAuth scopes are `calendar.freebusy` and `calendar.events`; Privacy Policy documents the corresponding Google user-data access and Limited Use boundaries.

## Realtime UX
- `lib/ui/use-data-sync.ts`
- `availability_revisions` singleton `_id=public-booking`
- `appointment_revisions` singleton `_id=admin-appointments`
- Public availability checks are Mongo-only about every 3 seconds while visible.
- Appointment/admin refreshes use Mongo revisions rather than repeated Google API polling.

## Mongo collections
`appointments`, `appointment_booking_locks`, `google_calendar_connections`, `google_calendar_busy_cache`, `google_calendar_discovered_conflicts`, `availability_revisions`, `appointment_revisions`, `admin_login_rate_limits`, `admin_credentials`, `admin_passkeys`, `admin_passkey_challenges`, `site_settings`, `cms_services`, `cms_availability`, `profile_media.files`, `profile_media.chunks`.

## UI / responsive architecture
- `components/admin/layout/admin-shell.tsx` owns admin responsive shell.
- `components/admin/navigation/admin-sidebar.tsx`, `admin-mobile-nav.tsx`, `admin-topbar.tsx`, `admin-breadcrumbs.tsx` provide desktop/mobile navigation.
- `components/public/navigation/public-header.tsx`, `public-nav.tsx`, `mobile-nav.tsx` provide public navigation.
- `components/public/booking/booking-flow.tsx` orchestrates service → date/time → details → review → appointment creation.
- `booking-date-time-picker.tsx` uses responsive date/time grids and timezone selection.
- `components/public/layout/public-footer.tsx` exposes Privacy Policy, Terms of Service, Cookie Policy, and Data Deletion links.
- Global `app/globals.css` provides focus-visible outlines, antialiasing, base colors and Tailwind/shadcn theme tokens.
- Phase 17 hardening added keyboard Escape handling, modal semantics, body-scroll locking and ≥44px touch targets to mobile navigation/account controls, password-policy hints, and `aria-current="step"` booking progress semantics.

## Security controls
1. `/admin/*` redirects unauthenticated users before private UI renders.
2. Sensitive admin APIs enforce server-side sessions; UI is never authorization.
3. Public APIs never expose drafts.
4. No public account creation.
5. No plaintext passwords/secrets in source control.
6. Session/challenge/OAuth cookies use `__Host-`, Secure, HttpOnly, SameSite controls.
7. Google OAuth state is signed, short-lived, single-use.
8. WebAuthn challenges are server-side and single-use.
9. Bearer-token appointment responses are `private, no-store`.
10. `next.config.ts` provides MIME-sniffing, clickjacking, referrer, Permissions-Policy, CSP baseline, production HSTS and disables `X-Powered-By`.
11. Public legal pages contain no admin-session dependency and are intended to be crawlable for Google OAuth brand/privacy verification.

## Legal / privacy architecture
- `app/privacy-policy/page.tsx` — comprehensive privacy notice covering personal data, GDPR-style rights, retention/deletion, international transfers, security, minors, and Google Calendar user data.
- `app/terms/page.tsx` — public terms covering booking, cancellation, online sessions, cross-border professional-service considerations, acceptable use, liability, and disputes.
- `app/cookie-policy/page.tsx` — essential-cookie disclosure; no advertising or behavioral tracking cookies in the core application.
- `app/data-deletion/page.tsx` — public deletion-request instructions and Google Calendar disconnect/deletion explanation.
- These policies are written to support Google OAuth verification, but legal compliance or Google verification is not guaranteed merely by publishing them; actual product behavior, OAuth scopes, domain verification, consent-screen configuration, and contact/legal-entity information must remain consistent with the published disclosures.

## Phase status
- Phases 0–13: **Complete**.
- Phase 14 internationalization: **Removed; English-only**.
- Phase 15 separate notifications: **Removed; Google Calendar/Meet notifications are sufficient**.
- Phase 16A admin identity/private isolation: **Complete**.
- Phase 16B passkeys/WebAuthn: **Complete and browser ceremony validated**.
- Phase 16C security/privacy audit/remediation: **Complete**; report `docs/SECURITY_AUDIT_16C.md`.
- Phase 17 responsive/accessibility final pass: **Implemented initial final-pass hardening**; remaining validation is manual/local production QA rather than CI browser tests.
- Phase 18 automated testing/CI: **Removed** at the project owner's request. Temporary regression tests, browser smoke tests, Playwright configuration and CI workflow are no longer part of the application architecture.
- Phase 19 production deployment: **Planned** — Vercel-only hosting is the current deployment architecture; MongoDB Atlas remains authoritative; Google Cloud OAuth remains the calendar integration. Cloudflare is optional only if a custom domain is introduced later.
- Phase 20 handover: **Planned**.
- Legal/privacy policy milestone: **Implemented on feature branch `feature/legal-policies`; requires owner review of legal identity/contact details and local/preview QA before merge to `main`.**

## Environment configuration
Admin: `GRACE_ADMIN_USERNAME`, `GRACE_ADMIN_PASSWORD_HASH`, `GRACE_ADMIN_SESSION_SECRET`.
Production WebAuthn: `GRACE_ADMIN_ORIGIN`, `GRACE_ADMIN_RP_ID`.
Google Calendar: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`, `GOOGLE_CALENDAR_THERAPIST_EMAIL`, `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`, `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`.

## Change discipline
1. `main` is the production/source-of-truth branch.
2. Inspect latest `main` before every change.
3. New features, fixes, refactors, security changes, and potentially disruptive changes should use a dedicated feature branch and Pull Request; do not push them directly to `main` unless explicitly authorized.
4. Reuse existing filenames/functions/types/services; do not create parallel scheduling logic or `-v2`/`-new` replacements.
5. MongoDB remains the booking source of truth.
6. Persisted services/availability/settings override static fallback after initialization.
7. Never poll Google from public realtime loops.
8. Every sensitive admin API must authenticate server-side; public routes must never gain admin-session dependencies.
9. Passkeys belong only to the pre-created admin account.
10. Before production-ready claims, run local lint, typecheck, build and relevant manual/lifecycle checks. No CI test suite is part of the project unless explicitly requested again.

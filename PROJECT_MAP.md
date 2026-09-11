# Grace Session Scheduler — Project Map

> Authoritative architecture/progress map. `main` is the source of truth. Update this file whenever phases, architecture, filenames or important functions change.

## Product rules
- No patient accounts; no clinical notes.
- MongoDB is authoritative for Grace Sessions appointments and booking state.
- `appointment_booking_locks` provides booking concurrency protection.
- Google Calendar is the therapist-calendar integration/external free-busy signal and event projection.
- `googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google Calendar API identifier (`primary`). Never mix them.
- Online appointments request Google Meet through Calendar conference data.
- Calendar create/update/delete uses `sendUpdates: all` for guest notifications.
- Public availability synchronization is MongoDB-revision driven; the 3-second loop never polls Google.
- Admin must operate the whole product without source-code edits after deployment configuration is complete.
- Reuse existing booking, conflict, lock, appointment and calendar services; never create parallel scheduling logic.
- Time display uses 24-hour `HH:mm` throughout scheduling surfaces.
- Timezone selection uses `components/ui/timezone-select.tsx` and runtime IANA values.
- Profile content is optional and scaffold-driven; empty public sections stay hidden.
- Profile drafts are private and explicit publishing is required.
- The product is intentionally English-only.
- Patient notifications are intentionally handled by Google Calendar/Google Meet; no separate notification provider.
- **Public and admin applications are isolated.** Public pages never depend on an admin session. Every admin page is protected by the admin route layout, and every admin API performs its own server-side admin-session check.
- There is no public registration or profile-creation flow for the therapist account.
- Passkeys are an admin-only authentication capability; patients never interact with the admin WebAuthn flow.

## Technology
Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MongoDB driver/Atlas, Google Calendar API/OAuth, Google Meet via Calendar conferenceData, SimpleWebAuthn for WebAuthn/passkeys.

## Architecture
```text
PUBLIC
  /                         published therapist profile + automatic profile details/content + services preview
  /book                     persisted services + booking engine
  /appointment/[token]      appointment management
  /appointment/[token]/reschedule
  /api/profile/image        published therapist profile image; draft image requires admin session

PRIVATE ADMIN
  /admin                    protected therapist dashboard
  /admin/services           persistent Services CMS
  /admin/availability       persistent Availability CMS
  /admin/calendar           therapist schedule + Google Calendar connection
  /admin/appointments      appointment management
  /admin/profile            persistent Profile CMS + private autosaved draft
  /admin/profile/preview    authenticated full website preview using draft content
  /admin/booking-settings   persistent Booking Settings CMS
  /admin-login              private therapist login entry point

AUTHENTICATION
  lib/admin/auth.ts
    adminUsername
    isAdminAuthConfigured()
    isAdminAuthenticated()
    requireAdminSession()
    loginAdmin()
    logoutAdmin()
    establishAdminSession()
    AdminAuthenticationError
    AdminAuthenticationConfigurationError
  lib/admin/passkeys.ts
    beginAdminPasskeyRegistration()
    finishAdminPasskeyRegistration()
    beginAdminPasskeyAuthentication()
    finishAdminPasskeyAuthentication()
    getAdminPasskeyStatus()
  components/admin/auth/admin-login-form.tsx — password + passkey sign-in
  components/admin/account/admin-account-menu.tsx — password change + passkey enrollment
  app/admin-login/page.tsx
  app/api/admin/auth/login/route.ts
  app/api/admin/auth/logout/route.ts
  app/api/admin/auth/passkey/register/options/route.ts
  app/api/admin/auth/passkey/register/verify/route.ts
  app/api/admin/auth/passkey/login/options/route.ts
  app/api/admin/auth/passkey/login/verify/route.ts
  app/api/admin/auth/passkey/status/route.ts
  app/admin/layout.tsx — server-side protection for the complete `/admin/*` route tree
  MongoDB: `admin_login_rate_limits` — short-lived failed-login rate-limit records
  MongoDB: `admin_credentials` — active therapist/admin password hash
  MongoDB: `admin_passkeys` — registered WebAuthn public credentials and counters
  Session: signed HttpOnly `grace_admin_session`, 8-hour lifetime, `SameSite=Lax`, credential-version bound
  Passkey challenge: short-lived signed HttpOnly `grace_admin_passkey_challenge` cookie; no separate paid service

GOOGLE AUTHENTICATION
  lib/admin/setup-auth.ts — Google Calendar OAuth configuration + short-lived OAuth state only
    isGoogleCalendarConfigured()
    createGoogleCalendarOAuthState()
    consumeGoogleCalendarOAuthState()
  `GOOGLE_CALENDAR_OAUTH_STATE_SECRET` signs the OAuth state cookie.
  The old `GOOGLE_CALENDAR_SETUP_SECRET` / temporary setup-unlock flow has been removed.

SHARED UI
  components/ui/timezone-select.tsx — searchable full IANA timezone input

CMS
  lib/cms/site-settings-repository.ts
    getTherapistProfile() — published profile
    getTherapistProfileDraft() — private draft
    saveTherapistProfileDraft() — autosaved draft persistence
    publishTherapistProfile() — explicit draft-to-public promotion
    getBookingSettings() — persisted booking rules with defaults
    saveBookingSettings() — validates and persists booking rules
  lib/cms/services-repository.ts
  lib/cms/availability-repository.ts
  components/admin/profile/profile-form.tsx
  components/admin/profile/profile-content-fields.tsx
  components/public/profile/profile-details.tsx
  components/public/profile/profile-content.tsx
  components/public/profile/profile-faq.tsx
  app/api/admin/profile/route.ts — admin-session protected draft GET/PUT + publish POST
  app/api/admin/profile/image/route.ts — admin-session protected draft GridFS image upload/removal
  app/api/profile/image/route.ts — public published image + admin-protected draft image
  app/admin/profile/preview/page.tsx — admin-session protected full draft preview
  MongoDB: `site_settings` (`therapist-profile`, `therapist-profile-draft`, `booking-settings`)
  MongoDB GridFS: `profile_media` (`therapist-profile-image`, `therapist-profile-image-draft`)

BOOKING
  lib/config/booking-settings.ts — defaults + validation
  lib/booking/slot-types.ts
  lib/booking/time-utils.ts
  lib/booking/availability-engine.ts
  lib/booking/conflict-engine.ts
  lib/booking/slot-engine.ts
  lib/booking/booking-engine.ts
  lib/booking/public-availability-service.ts
  `getBookableSlotsWithConfiguration()` is the runtime persisted-configuration boundary; `getBookableSlots()` remains compatibility/default fallback.

APPOINTMENTS
  lib/appointments/appointment-types.ts
  lib/appointments/appointment-repository.ts
  lib/appointments/appointment-service.ts
    createAppointment()
    rescheduleAppointment()
    cancelAppointment()
    findAppointmentByToken()
    findActiveAppointmentsOverlapping()
    updateAppointmentStatus()
    updateGoogleCalendarSyncStatus()
  components/admin/appointments/admin-appointment-scheduling.tsx — shared admin create/reschedule picker
  components/admin/appointments/admin-appointments-manager.tsx
  Public appointment controls enforce patient cancellation/rescheduling policy server-side.
  Admin appointment operations remain therapist-controlled.

CALENDAR
  lib/calendar/google-calendar-config.ts
  lib/calendar/google-calendar-types.ts
  lib/calendar/google-calendar-crypto.ts
  lib/calendar/google-calendar-repository.ts
  lib/calendar/google-calendar-service.ts
  lib/calendar/google-calendar-event-service.ts
  app/api/admin/calendar/route.ts — admin-session protected
  app/api/admin/google-calendar/connect/route.ts — admin-session protected
  app/api/admin/google-calendar/callback/route.ts — admin-session protected + OAuth state verification
  app/api/admin/google-calendar/status/route.ts — admin-session protected
  app/api/admin/google-calendar/disconnect/route.ts — admin-session protected
  app/api/admin/google-calendar/sync/route.ts — admin-session protected
  components/admin/calendar/admin-calendar.tsx
  components/admin/calendar/google-calendar-card.tsx

REALTIME UX
  lib/ui/use-data-sync.ts
  app/api/availability/revision/route.ts — public Mongo-only availability revision
  app/api/admin/appointments/revision/route.ts — admin-session protected appointment revision
  app/api/appointments/revision/route.ts — public appointment-management revision
  availability_revisions singleton `_id = public-booking`
  appointment_revisions singleton `_id = admin-appointments`
  Public 3-second availability checks never call Google Calendar.

MONGO COLLECTIONS
  appointments
  appointment_booking_locks
  google_calendar_connections
  google_calendar_busy_cache
  google_calendar_discovered_conflicts
  availability_revisions
  appointment_revisions
  admin_login_rate_limits
  admin_credentials
  admin_passkeys
  site_settings
  cms_services
  cms_availability
  profile_media.files / profile_media.chunks

## Admin isolation rules
1. `/admin/*` is private and redirects unauthenticated users to `/admin-login` before the admin UI renders.
2. Admin APIs do not trust the UI; each sensitive endpoint calls `requireAdminSession()` on the server.
3. Public APIs never return draft profile content or draft profile media.
4. Public profile navigation contains no admin link.
5. Admin shell navigation remains inside the admin route tree; the admin logo points to `/admin` rather than the public homepage.
6. The profile draft preview intentionally uses the public visual shell so the therapist can inspect the patient-facing design, but the route itself is private and server-authenticated.
7. There is no public account creation flow.
8. The admin password is never stored in source control. Only a scrypt password hash is supplied through deployment environment configuration.
9. Admin sessions are signed HttpOnly cookies. The session is bound to a credential-version fingerprint so changing the configured password hash invalidates existing sessions.
10. Failed password attempts use short-lived Mongo-backed rate-limit records; raw client IP addresses are not stored.
11. Google Calendar OAuth state uses a separate `GOOGLE_CALENDAR_OAUTH_STATE_SECRET` and remains independent from therapist authentication.
12. The old Google Calendar setup-key endpoint is removed; Google Calendar operations now use the authenticated therapist session.
13. Passkey enrollment requires an existing admin session.
14. Passkey authentication uses WebAuthn user verification and a signed, five-minute challenge cookie.
15. Passkey private keys never reach the application or MongoDB; only the public credential key, credential ID and authenticator counter are stored.
16. Password authentication remains available as the recovery path; passkeys do not remove the existing password mechanism.

## Phase status

### Phase 0 — Foundation
**Complete.**

### Phase 1 — Design system + shells
**Complete.** Approved CMS/admin layout and button placement preserved.

### Phase 2 — Public therapist profile
**Complete + CMS connected.** Public homepage reads the published profile and uses reusable presentation scaffolds.

### Phase 3 — Services CMS
**Complete.** Persisted `cms_services` source of truth.

### Phase 4 — Availability management
**Complete.** Persisted weekly rules/exceptions, quick tools, partial-day exception semantics and shared timezone control.

### Phase 5 — Booking engine
**Complete.** Existing slot/conflict logic remains authoritative and consumes persisted booking configuration at runtime.

### Phase 6 — Patient booking experience
**Complete + UI polish.** Service → timezone → date/time → details → review → appointment creation.

### Phase 7 — Appointment persistence/management
**Complete.** Idempotency, transactional booking locks, cancellation, rescheduling and appointment lifecycle established.

### Phase 8 — Patient calendar support
**Complete.** Google Calendar, Outlook, Apple/ICS support.

### Phase 9 — Therapist Google Calendar
**Complete.** OAuth, encrypted refresh tokens, FreeBusy, cached busy data, manual sync, disconnect and fail-closed final validation.

### Phase 9.1 — Public availability realtime
**Complete.** Mongo-only revision checks about every 3 seconds while visible.

### Phase 9.2 — External conflict learning
**Complete.** Google external conflicts persist to `google_calendar_discovered_conflicts` and bump public availability revision.

### Phase 10 — Google Calendar events + Meet
**Complete and end-to-end validated.** Deterministic event projection, update/delete, Google Meet, attendees and public rescheduling.

### Phase 11 — Admin appointment management + therapist calendar
**Complete.** Search/filter/status management, direct admin scheduling, native availability-picker rescheduling, Meet access, Calendar sync state/retry and responsive therapist week calendar.

### Phase 12 — Profile CMS
**Complete.** Published/draft separation, autosave, review/publish, full preview, optional profile fields, quick-add content and draft-safe GridFS images.

### Phase 13 — Booking settings CMS
**Complete.** Persisted booking rules with therapist-friendly ⓘ help, runtime slot consumption, patient cancellation/rescheduling policy enforcement and visible disabled patient controls when self-service is disabled.

### Phase 14 — Internationalization
**Removed.** Product is intentionally English-only.

### Phase 15 — Notifications
**Removed.** Google Calendar/Meet notifications are sufficient for the current product.

### Phase 16 — Security/privacy
**In progress — 16A and 16B implemented on the passkey branch.**

#### Phase 16A — Admin identity & public/private isolation
**Implemented.**
- Dedicated private `/admin-login` entry point.
- Pre-created therapist account model; no signup.
- Username/password authentication.
- Signed HttpOnly 8-hour admin session.
- Server-side `/admin/*` protection.
- Server-side admin API protection.
- Mongo-backed failed-login rate limiting.
- Admin logout.
- Admin logo stays within admin workspace.
- Temporary Google Calendar setup gate removed.
- Google OAuth state secret separated from admin authentication.
- Draft profile media and preview remain private.

#### Phase 16B — Passkeys / WebAuthn
**Implemented on branch `phase-16b-passkeys`; pending local validation and merge to `main`.**
- Maintained SimpleWebAuthn browser/server libraries added; no paid authentication provider.
- Existing password login remains available as recovery/fallback.
- Authenticated therapist can enroll one or more passkeys from the existing account menu.
- Passkey sign-in is available directly on `/admin-login`.
- MongoDB `admin_passkeys` stores credential ID, public key, counter, transports and timestamps only.
- Registration and authentication challenges use the existing `GRACE_ADMIN_SESSION_SECRET` to create short-lived signed HttpOnly challenge cookies; no new secret is required.
- WebAuthn user verification is required for registration and authentication.
- Relying-party ID/origin are derived from the current request host; no new deployment service is required.
- Private key material stays on the user's authenticator and is never stored by the application.

#### Phase 16C — Broader security/privacy audit
**Planned.** Input validation review, token/PII exposure, error redaction, abuse protection, session lifecycle, Google OAuth security, privacy review and production secret audit.

### Phase 17 — Responsive/accessibility final pass
**Planned.** Mobile/tablet/desktop, keyboard/focus, semantics, contrast, forms, dialogs, calendar and touch targets.

### Phase 18 — Automated testing
**Planned.** Booking/DST/concurrency/lifecycle/Google/API regression suite, including admin authentication, passkey/WebAuthn flows and public/private isolation tests.

### Phase 19 — Production deployment
**Planned.** Vercel + MongoDB Atlas + Google Cloud OAuth, production secrets/configuration, smoke tests, monitoring and recovery.

### Phase 20 — Handover
**Planned.** Non-technical therapist operating guide covering appointments, services, availability, profile, settings, Calendar, Meet, conflicts and sync failures.

## Environment configuration
Required/private admin configuration:
- `GRACE_ADMIN_USERNAME` (defaults to `gracevpaul`)
- `GRACE_ADMIN_PASSWORD_HASH`
- `GRACE_ADMIN_SESSION_SECRET`

Google Calendar configuration:
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `GOOGLE_CALENDAR_THERAPIST_EMAIL`
- `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`
- `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`

Passkeys require no additional paid provider or environment secret.

Never commit plaintext passwords, OAuth secrets, refresh tokens, or production session secrets.

## Current source-of-truth rules
1. `main` is the working branch unless explicitly changed.
2. Inspect latest `main` before every change.
3. Preserve existing filenames/functions/types unless a justified architectural change requires otherwise.
4. MongoDB is authoritative for application booking state.
5. Services are authoritative in `cms_services` once persisted; static service config is fallback only for an uninitialized installation.
6. Availability rules/exceptions are authoritative in `cms_availability` once persisted; static availability config is fallback only for an uninitialized installation.
7. Existing `unavailable` and `custom-hours` exception documents remain valid; `unavailable-hours` blocks only a specific interval.
8. Never bypass booking validation or booking locks.
9. Google external conflicts belong in `google_calendar_discovered_conflicts`.
10. Never poll Google Calendar from the public revision loop.
11. CMS writes affecting availability bump `availability_revisions`.
12. Profile content is optional and presentation is scaffold-driven.
13. Profile drafts must never be returned by public pages or public profile APIs.
14. Profile publishing is explicit; autosave never publishes.
15. Do not add cron/Redis/Kafka/microservices unless explicitly requested.
16. Do not create `-v2`, `-v3`, `-new` or similar replacement filenames.
17. Profile photos use MongoDB GridFS (`profile_media`).
18. Booking rules are stored in the existing `site_settings` CMS document and read at runtime.
19. Patient cancellation/rescheduling rules are enforced server-side; admin operations remain therapist-controlled.
20. Admin authentication is independent from Google Calendar authentication.
21. Every admin API must enforce server-side admin authentication even when its caller is already behind the protected admin UI.
22. Public routes must never gain a dependency on admin authentication.
23. Passkey credentials belong only to the pre-created admin account and are stored in MongoDB; do not introduce a separate user/account architecture.
24. Before production-ready claims, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` and relevant lifecycle/security tests locally.

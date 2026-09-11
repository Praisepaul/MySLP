# Grace Session Scheduler — Project Map

> **Authoritative architecture/progress map.** `main` is the source of truth. Update this file whenever phases, architecture, filenames, functions, collections, security controls, or environment rules change.

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
- Public and admin applications are isolated. Public pages never depend on an admin session. Every admin page is protected by the admin route layout, and every admin API performs its own server-side admin-session check.
- There is no public registration or profile-creation flow for the therapist account.
- Passkeys are admin-only authentication; patients never interact with the admin WebAuthn flow.

## Technology
Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MongoDB driver/Atlas, Google Calendar API/OAuth, Google Meet via Calendar `conferenceData`, SimpleWebAuthn browser/server.

## Public routes
- `/` — published therapist profile + automatic profile details/content + services preview
- `/book` — persisted services + booking engine
- `/appointment/[token]` — appointment management
- `/appointment/[token]/reschedule`
- `/api/profile/image` — published profile image; draft image requires admin session
- `/api/appointments/[confirmationToken]` — bearer-token appointment GET/PATCH/DELETE; responses are private/no-store
- `/api/appointments/[confirmationToken]/ics` — bearer-token ICS download; private/no-store

## Private admin routes
- `/admin` — protected therapist dashboard
- `/admin/services`
- `/admin/availability`
- `/admin/calendar`
- `/admin/appointments`
- `/admin/profile`
- `/admin/profile/preview`
- `/admin/booking-settings`
- `/admin-login` — private therapist login entry point

## Authentication architecture
### `lib/admin/auth.ts`
- `adminUsername`
- `isAdminAuthConfigured()`
- `isAdminAuthenticated()`
- `requireAdminSession()`
- `loginAdmin()`
- `logoutAdmin()`
- `establishAdminSession()`
- `hashAdminPassword()`
- `verifyAdminPassword()`
- `changeAdminPassword()`
- `AdminAuthenticationError`
- `AdminAuthenticationConfigurationError`

Controls:
- Signed HttpOnly `__Host-grace_admin_session` cookie.
- 8-hour lifetime, `SameSite=Lax`, Secure, path `/`, no Domain attribute.
- Session payload contains issuance time, normalized admin username, password-hash credential version and random nonce; HMAC-SHA256 protects integrity.
- Password-hash credential version invalidates existing sessions after password-hash rotation.
- Password fallback remains available for recovery.
- Failed password attempts use MongoDB-backed short-lived rate-limit records; raw IP is not stored.
- Password changes require the existing password and a 15–128 character new password.
- Generated password hashes use scrypt `N=32768`, `r=8`, `p=2`, 64-byte output and 16-byte random salt. Legacy supported hashes may still be verified; new hashes use the stronger configuration.

### Passkeys / WebAuthn — `lib/admin/passkeys.ts`
- `beginAdminPasskeyRegistration()`
- `finishAdminPasskeyRegistration()`
- `beginAdminPasskeyAuthentication()`
- `finishAdminPasskeyAuthentication()`
- `getAdminPasskeyStatus()`
- `getPasskeyUserLabel()`

Passkey routes:
- `app/api/admin/auth/passkey/register/options/route.ts`
- `app/api/admin/auth/passkey/register/verify/route.ts`
- `app/api/admin/auth/passkey/login/options/route.ts`
- `app/api/admin/auth/passkey/login/verify/route.ts`
- `app/api/admin/auth/passkey/status/route.ts`

Passkey controls:
- Registration requires an authenticated admin session.
- Discoverable credentials (`residentKey: required`) and user verification are required.
- Authentication also requires user verification.
- Challenges are stored server-side in MongoDB and additionally bound to a signed HttpOnly `__Host-grace_admin_passkey_challenge` cookie.
- Challenge lifetime is 5 minutes.
- Challenge consumption is one-time: verification atomically deletes the server-side challenge before authentication/registration is accepted.
- Challenge collection has a TTL index on `expiresAt`.
- `admin_passkeys.credentialId` has a unique index; `userId` has a lookup index.
- Credential public key, credential ID, authenticator counter, transports and timestamps are stored; private key material never reaches the application or MongoDB.
- Successful authentication updates the authenticator counter with an optimistic concurrency predicate on the previously stored counter.
- Production WebAuthn RP ID and origin are pinned through `GRACE_ADMIN_RP_ID` and `GRACE_ADMIN_ORIGIN`; production fails closed if either is missing. Development falls back to localhost.
- No paid authentication provider is used.

### UI
- `components/admin/auth/admin-login-form.tsx` — passkey-first sign-in, password fallback.
- `components/admin/account/admin-account-menu.tsx` — password change + passkey enrollment.
- `app/admin/layout.tsx` — server-side protection for the complete `/admin/*` route tree.

### Google authentication
`lib/admin/setup-auth.ts`:
- `isGoogleCalendarConfigured()`
- `createGoogleCalendarOAuthState()`
- `consumeGoogleCalendarOAuthState()`

Controls:
- OAuth state is 32 random bytes, signed with `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`, expires after 10 minutes and is consumed once.
- State cookie is `__Host-grace_google_calendar_oauth_state`, HttpOnly, Secure, `SameSite=Lax`, path `/`.
- Google authentication is independent from therapist/admin authentication.
- Old Google Calendar setup-key flow is removed.

## CMS
- `lib/cms/site-settings-repository.ts`: `getTherapistProfile()`, `getTherapistProfileDraft()`, `saveTherapistProfileDraft()`, `publishTherapistProfile()`, `getBookingSettings()`, `saveBookingSettings()`.
- `lib/cms/services-repository.ts`
- `lib/cms/availability-repository.ts`
- `components/admin/profile/profile-form.tsx`
- `components/admin/profile/profile-content-fields.tsx`
- `components/public/profile/profile-details.tsx`
- `components/public/profile/profile-content.tsx`
- `components/public/profile/profile-faq.tsx`
- `app/api/admin/profile/route.ts` — admin protected draft GET/PUT + publish POST
- `app/api/admin/profile/image/route.ts` — admin protected draft GridFS upload/removal
- `app/api/profile/image/route.ts` — public published image + admin-protected draft image
- `app/admin/profile/preview/page.tsx` — private full draft preview
- Mongo `site_settings`: `therapist-profile`, `therapist-profile-draft`, `booking-settings`
- Mongo GridFS `profile_media`: `therapist-profile-image`, `therapist-profile-image-draft`

## Booking
- `lib/config/booking-settings.ts`
- `lib/booking/slot-types.ts`
- `lib/booking/time-utils.ts`
- `lib/booking/availability-engine.ts`
- `lib/booking/conflict-engine.ts`
- `lib/booking/slot-engine.ts`
- `lib/booking/booking-engine.ts`
- `lib/booking/public-availability-service.ts`
- `getBookableSlotsWithConfiguration()` is the runtime persisted-config boundary; `getBookableSlots()` is compatibility/default fallback.
- Never bypass booking validation or booking locks.

## Appointments
- `lib/appointments/appointment-types.ts`
- `lib/appointments/appointment-repository.ts`
  - `ensureAppointmentIndexes()`
  - `findAppointmentByIdempotencyKey()`
  - `findAppointmentByToken()`
  - `findActiveAppointmentsOverlapping()`
  - `findAdminAppointments()`
  - `toAppointmentPublicView()`
  - `cancelAppointment()`
  - `updateAppointmentStatus()`
  - `updateAppointmentSchedule()`
  - `updateGoogleCalendarSyncStatus()`
- `lib/appointments/appointment-service.ts`
  - `createAppointment()`
  - `rescheduleAppointment()`
  - `cancelAppointment()`
  - `AppointmentBookingError`
- Public appointment token is a bearer capability; appointment APIs now send `Cache-Control: private, no-store`.
- Public appointment responses intentionally expose only the patient-facing appointment view; admin APIs add therapist-only management fields.
- Cancellation/rescheduling policy is enforced server-side.
- Mongo remains authoritative if Google Calendar reconciliation fails.

## Calendar
- `lib/calendar/google-calendar-config.ts`
- `lib/calendar/google-calendar-types.ts`
- `lib/calendar/google-calendar-crypto.ts`
- `lib/calendar/google-calendar-repository.ts`
- `lib/calendar/google-calendar-service.ts`
- `lib/calendar/google-calendar-event-service.ts`
- `app/api/admin/calendar/route.ts`
- `app/api/admin/google-calendar/connect/route.ts`
- `app/api/admin/google-calendar/callback/route.ts`
- `app/api/admin/google-calendar/status/route.ts`
- `app/api/admin/google-calendar/disconnect/route.ts`
- `app/api/admin/google-calendar/sync/route.ts`
- All admin Calendar routes require `requireAdminSession()` server-side.
- Refresh tokens are encrypted with AES-256-GCM using `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY` before MongoDB storage.

## Realtime UX
- `lib/ui/use-data-sync.ts`
- `app/api/availability/revision/route.ts` — public Mongo-only availability revision
- `app/api/admin/appointments/revision/route.ts` — admin protected appointment revision
- `app/api/appointments/revision/route.ts` — public appointment-management revision
- `availability_revisions` singleton `_id = public-booking`
- `appointment_revisions` singleton `_id = admin-appointments`
- Public 3-second availability checks never call Google Calendar.

## MongoDB collections
- `appointments`
- `appointment_booking_locks`
- `google_calendar_connections`
- `google_calendar_busy_cache`
- `google_calendar_discovered_conflicts`
- `availability_revisions`
- `appointment_revisions`
- `admin_login_rate_limits`
- `admin_credentials`
- `admin_passkeys`
- `admin_passkey_challenges`
- `site_settings`
- `cms_services`
- `cms_availability`
- `profile_media.files`
- `profile_media.chunks`

## Security isolation rules
1. `/admin/*` is private and redirects unauthenticated users to `/admin-login` before admin UI renders.
2. Every sensitive admin API performs server-side admin authentication; UI protection is never trusted as authorization.
3. Public APIs never return draft profile content or draft profile media.
4. There is no public account creation flow.
5. Admin password plaintext is never stored in source control.
6. Session and challenge cookies are host-only `__Host-` cookies with Secure/HttpOnly/SameSite controls.
7. Google OAuth state is signed, short-lived and single-use.
8. Passkey challenges are server-side state plus signed cookie binding and are single-use.
9. Appointment bearer-token responses are explicitly no-store.
10. Global security headers include MIME-sniffing protection, clickjacking protection, strict referrer policy, restrictive Permissions-Policy, basic CSP restrictions and production HSTS.
11. `X-Powered-By` is disabled.
12. Never commit plaintext passwords, OAuth secrets, refresh tokens, production session secrets or other credentials.

## Phase status
### Phase 0 — Foundation
**Complete.**
### Phase 1 — Design system + shells
**Complete.**
### Phase 2 — Public therapist profile
**Complete + CMS connected.**
### Phase 3 — Services CMS
**Complete.** Persisted `cms_services` source of truth.
### Phase 4 — Availability management
**Complete.** Persisted weekly rules/exceptions, quick tools, partial-day exception semantics and timezone control.
### Phase 5 — Booking engine
**Complete.** Existing slot/conflict logic remains authoritative and consumes persisted booking configuration at runtime.
### Phase 6 — Patient booking experience
**Complete + UI polish.** Service → timezone → date/time → details → review → appointment creation.
### Phase 7 — Appointment persistence/management
**Complete.** Idempotency, transactional booking locks, cancellation, rescheduling and lifecycle established.
### Phase 8 — Patient calendar support
**Complete.** Google Calendar, Outlook, Apple/ICS support.
### Phase 9 — Therapist Google Calendar
**Complete.** OAuth, encrypted refresh tokens, FreeBusy, cached busy data, manual sync, disconnect and fail-closed final validation.
### Phase 9.1 — Public availability realtime
**Complete.** Mongo-only revision checks about every 3 seconds while visible.
### Phase 9.2 — External conflict learning
**Complete.** Google external conflicts persist and bump public availability revision.
### Phase 10 — Google Calendar events + Meet
**Complete and end-to-end validated.** Deterministic event projection, update/delete, Google Meet, attendees and public rescheduling.
### Phase 11 — Admin appointment management + therapist calendar
**Complete.** Search/filter/status management, direct admin scheduling, native availability-picker rescheduling, Meet access, Calendar sync state/retry and responsive therapist week calendar.
### Phase 12 — Profile CMS
**Complete.** Published/draft separation, autosave, review/publish, full preview, optional profile fields, quick-add content and draft-safe GridFS images.
### Phase 13 — Booking settings CMS
**Complete.** Persisted booking rules, runtime slot consumption and patient self-service policy enforcement.
### Phase 14 — Internationalization
**Removed.** Product is intentionally English-only.
### Phase 15 — Notifications
**Removed.** Google Calendar/Meet notifications are sufficient.
### Phase 16 — Security/privacy
**16A and 16B implemented. 16C completed by this audit/remediation pass.**
#### 16A — Admin identity & public/private isolation
**Implemented.** Dedicated admin login, signed sessions, server-side admin API authorization, Mongo login rate limiting, logout, Google auth separation and private drafts/media.
#### 16B — Passkeys / WebAuthn
**Implemented and merged to `main`.** SimpleWebAuthn, passkey-first login, authenticated enrollment, multiple credentials, required user verification and recovery password path. Browser ceremony was end-to-end validated by the project owner.
#### 16C — Broader security/privacy audit
**Completed — remediation applied.** Scope included authentication/session lifecycle, WebAuthn challenge replay, RP/origin trust, public/private isolation, appointment bearer-token privacy, API validation/error handling, Google OAuth state, token encryption, Mongo security boundaries, security headers, password hashing policy, production secret/configuration review and dependency review. Formal findings and residual risks are recorded in `docs/SECURITY_AUDIT_16C.md`.
### Phase 17 — Responsive/accessibility final pass
**Planned.** Mobile/tablet/desktop, keyboard/focus, semantics, contrast, forms, dialogs, calendar and touch targets.
### Phase 18 — Automated testing
**Planned.** Booking/DST/concurrency/lifecycle/Google/API regression suite, including admin authentication, passkey/WebAuthn and public/private isolation tests.
### Phase 19 — Production deployment
**Planned.** Vercel + MongoDB Atlas + Google Cloud OAuth, production secrets/configuration, smoke tests, monitoring and recovery.
### Phase 20 — Handover
**Planned.** Non-technical therapist operating guide.

## Environment configuration
### Required/private admin
- `GRACE_ADMIN_USERNAME` (defaults to `gracevpaul`)
- `GRACE_ADMIN_PASSWORD_HASH`
- `GRACE_ADMIN_SESSION_SECRET` (minimum 32 characters)

### Production WebAuthn
- `GRACE_ADMIN_ORIGIN` — exact HTTPS application origin, no trailing slash
- `GRACE_ADMIN_RP_ID` — exact production WebAuthn RP ID/hostname

### Google Calendar
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `GOOGLE_CALENDAR_THERAPIST_EMAIL`
- `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`
- `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`

No additional paid provider or secret is required for passkeys.

## Source-of-truth/change discipline
1. `main` is the working branch unless explicitly changed.
2. Inspect latest `main` before every change.
3. Preserve existing filenames/functions/types unless a justified architectural change requires otherwise.
4. MongoDB is authoritative for application booking state.
5. Services are authoritative in `cms_services` once persisted; static service config is fallback only for an uninitialized installation.
6. Availability rules/exceptions are authoritative in `cms_availability` once persisted; static availability config is fallback only for an uninitialized installation.
7. Never bypass booking validation or booking locks.
8. Google external conflicts belong in `google_calendar_discovered_conflicts`.
9. Never poll Google Calendar from the public revision loop.
10. CMS writes affecting availability bump `availability_revisions`.
11. Profile drafts must never be returned by public pages or public profile APIs.
12. Profile publishing is explicit; autosave never publishes.
13. Do not add cron/Redis/Kafka/microservices unless explicitly requested.
14. Do not create `-v2`, `-v3`, `-new` or similar replacement filenames.
15. Profile photos use MongoDB GridFS (`profile_media`).
16. Booking rules are stored in the existing `site_settings` CMS document and read at runtime.
17. Patient cancellation/rescheduling rules are enforced server-side; admin operations remain therapist-controlled.
18. Admin authentication is independent from Google Calendar authentication.
19. Every admin API must enforce server-side admin authentication.
20. Public routes must never gain a dependency on admin authentication.
21. Passkey credentials belong only to the pre-created admin account; do not introduce a separate user/account architecture.
22. Before production-ready claims, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` and relevant lifecycle/security tests locally.

# Ephatha — Project Architecture Map

## Product / trust model
- MongoDB is authoritative for Ephatha appointments, booking state, persisted CMS settings, and realtime revisions.
- `appointment_booking_locks` protects booking concurrency. Never bypass booking validation or locks.
- Google Calendar is the external therapist-calendar/free/busy signal and event projection; MongoDB remains authoritative if Google reconciliation fails.
- `googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google API calendar identifier (`primary`). Never mix them.
- Online appointments request Google Meet through Calendar `conferenceData`.
- Calendar create/update/delete uses `sendUpdates: all`.

## Public routes
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
- `/api/availability`
- `/api/availability/revision`
- `/api/appointments/revision`

## Private admin routes
- `/admin`
- `/admin/services`
- `/admin/availability`
- `/admin/calendar`
- `/admin/appointments`
- `/admin/profile`
- `/admin/profile/preview`
- `/admin/booking-settings`
- `/admin-login`

## Calendar architecture
Modules: `lib/calendar/google-calendar-config.ts`, `google-calendar-types.ts`, `google-calendar-crypto.ts`, `google-calendar-repository.ts`, `google-calendar-service.ts`, `google-calendar-event-service.ts`.
- Refresh tokens are encrypted with AES-256-GCM using `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`.
- Admin Calendar routes require `requireAdminSession()`.
- Calendar failure never makes Mongo appointment state disappear.
- Current OAuth scopes are `calendar.freebusy` and `calendar.events`; Privacy Policy documents the corresponding Google user-data access and Limited Use boundaries.

## Realtime UX
- `lib/ui/use-data-sync.ts`
- Public availability and admin appointment refresh loops are MongoDB-revision driven; they do not poll Google Calendar.

## UI architecture
- `components/admin/layout/admin-shell.tsx`
- `components/admin/navigation/admin-sidebar.tsx`
- `components/admin/navigation/admin-mobile-nav.tsx`
- `components/admin/navigation/admin-topbar.tsx`
- `components/admin/navigation/admin-breadcrumbs.tsx`
- `components/public/navigation/public-header.tsx`, `public-nav.tsx`, `mobile-nav.tsx` provide public navigation.
- `components/public/booking/booking-flow.tsx` orchestrates service → date/time → details → review → appointment creation.
- `booking-date-time-picker.tsx` uses responsive date/time grids and timezone selection.
- `components/public/layout/public-footer.tsx` exposes Privacy Policy, Terms of Service, Cookie Policy, and Data Deletion links.
- Global `app/globals.css` provides focus-visible outlines, antialiasing, base colors and Tailwind/shadcn theme tokens.
- Phase 17 hardening added keyboard Escape handling, modal semantics, body-scroll locking and ≥44px touch targets to mobile navigation/account controls, password-policy hints, and `aria-current="step"` booking progress semantics.

## Security / privacy architecture
1. Production WebAuthn RP/origin is explicitly configured and pinned.
2. WebAuthn challenges are server-side, signed, short-lived, and single-use.
3. Appointment bearer-token responses are `private, no-store`.
4. `next.config.ts` provides MIME-sniffing, clickjacking, referrer, Permissions-Policy, CSP baseline, production HSTS and disables `X-Powered-By`.
5. Session/challenge/OAuth cookies use `__Host-`, Secure, HttpOnly, SameSite controls.
6. Public legal pages contain no admin-session dependency and are intended to be crawlable for Google OAuth brand/privacy verification.

## Legal / privacy architecture
- `app/privacy-policy/page.tsx` — formal Privacy Policy covering personal data, GDPR-style rights, retention/deletion, international transfers, security, minors, and Google Calendar user data.
- `app/terms/page.tsx` — formal Terms of Service covering booking, cancellation, online sessions, professional licensing, cross-border services, acceptable use, liability, and disputes.
- `app/cookie-policy/page.tsx` — formal Cookie Policy covering essential security/authentication cookies and the absence of advertising/behavioral tracking cookies in the core application.
- `app/data-deletion/page.tsx` — formal Data Deletion Policy and public deletion-request instructions, including Google Calendar disconnect/deletion boundaries.
- Privacy/legal contact: `gracepaulaslp@gmail.com`.
- Operator: **Grace Valookkaran Paul (Grace V Paul)**, RCI Central Rehabilitation Register (CRR) No. **A92329**, registered as an **Audiologist and Speech-Language Pathologist**.
- Professional qualifications recorded in the policy: BASLP (2022) and M.Sc. Speech-Language Pathology (2024), with the additional qualification recorded by RCI on February 24, 2025.
- RCI registration date: September 13, 2023; stated validity through February 22, 2030, subject to RCI requirements.
- The Privacy Policy and Terms cover clients in India, the United States, the EEA, the UK, Canada, Ireland, Australia, and other jurisdictions while preserving mandatory local rights.
- India is the general governing law stated in the Terms to the extent legally permitted; mandatory local consumer, privacy, healthcare, and telehealth laws are preserved.
- Policies describe the current architecture: Vercel hosting, MongoDB Atlas, Google Calendar/Meet, appointment bearer links, essential security cookies, encrypted Google OAuth refresh credentials, and no advertising/behavioral tracking.
- Legal pages are informational product documents and do not replace jurisdiction-specific legal advice. Before production publication, the operator should verify professional licensing/telehealth requirements, cancellation/refund rules, and any healthcare-specific privacy obligations applicable to each service location.

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

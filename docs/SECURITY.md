# Security Architecture

## Security principles

1. Authorization is enforced server-side.
2. MongoDB owns application state.
3. External integrations are untrusted boundaries.
4. Secrets never enter client bundles or source control.
5. Capability links are treated as credentials.
6. Security-sensitive state has explicit lifetime and replay controls.

## Admin authentication

`lib/admin/auth.ts` provides password authentication and signed sessions. The session cookie is `__Host-grace_admin_session` with Secure, HttpOnly, SameSite=Lax and Path=/; it has an eight-hour lifetime and no Domain attribute.

Credential-version binding invalidates sessions after password-hash rotation. Passwords are hashed with scrypt. Login rate limiting is stored in MongoDB without retaining raw client IP addresses.

## Passkeys

`lib/admin/passkeys.ts` uses WebAuthn with:

- server-generated challenges;
- short challenge lifetime;
- single-use challenge records;
- Mongo TTL cleanup;
- required user verification;
- unique credential IDs;
- authenticator counter concurrency protection;
- production origin/RP-ID pinning.

Never derive the production WebAuthn origin from an arbitrary request Host header.

## Google OAuth

OAuth state is signed, random, short-lived and single-use and is bound to a `__Host-` cookie. Refresh credentials are encrypted with AES-256-GCM before MongoDB persistence.

Current scopes are limited to `calendar.freebusy` and `calendar.events`.

## Appointment capability links

Public appointment management uses confirmation tokens as bearer capabilities. Treat these tokens like passwords: do not log them, place them in analytics payloads, expose them in error messages, or cache their API responses publicly.

Capability responses use `private, no-store` semantics.

## API authorization

Every sensitive `/api/admin/*` handler authenticates on the server. Public APIs never expose draft/private CMS content and never gain an admin-session dependency.

## Headers

`next.config.ts` provides the project's baseline security headers, including MIME-sniffing protection, clickjacking protection, referrer policy, Permissions-Policy, CSP baseline, production HSTS, and removal of `X-Powered-By`.

## Data boundaries

Do not log:

- passwords or password hashes;
- session cookies;
- WebAuthn challenges;
- OAuth authorization codes/state;
- Google refresh tokens;
- appointment confirmation tokens;
- MongoDB connection strings.

## Booking security

The client cannot reserve a slot merely by displaying it. The server recalculates/revalidates availability and uses `appointment_booking_locks` around the critical booking operation.

Idempotency and overlap checks prevent accidental duplicate or conflicting appointments.

## Incident response

If credentials are exposed:

1. Revoke/rotate the affected credential.
2. Rotate the relevant application secret where safe.
3. Invalidate admin sessions by rotating credentials/version as appropriate.
4. Disconnect/reconnect Google Calendar if OAuth credentials are compromised.
5. Inspect logs and MongoDB records for unauthorized activity.
6. Document the incident and remediation.

See `docs/OPERATIONS.md` for operational response guidance.

## Scope limitations

This document describes implemented application controls; it is not a certification or guarantee of compliance with any healthcare/privacy framework. Professional, telehealth, privacy and data-residency obligations must be assessed for the jurisdictions in which the service operates.

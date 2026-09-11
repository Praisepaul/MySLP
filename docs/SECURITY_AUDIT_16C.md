# Grace Session Scheduler — Phase 16C Security & Privacy Audit

**Audit:** Phase 16C — Broader Security/Privacy Audit  
**Repository:** `Praisepaul/MySLP`  
**Branch:** `main`  
**Audit date:** 2026-09-11  
**Assessment type:** Source-code security architecture review with remediation  
**Auditor:** Engineering/security review performed in-session against the repository source of truth  
**Formal third-party pentest:** No  
**Compliance certification:** No

## 1. Executive summary

Phase 16C reviewed the implemented Grace Session Scheduler architecture with emphasis on authentication, authorization, WebAuthn/passkeys, session lifecycle, public/private isolation, appointment bearer tokens, Google OAuth, credential encryption, MongoDB concurrency boundaries, API validation/error handling, security headers, password storage, and production configuration.

The review identified several hardening gaps that were appropriate to remediate before production deployment. The most important were:

1. WebAuthn challenges were previously held only in a signed cookie and were not server-side single-use state. This created a replay/concurrency concern, especially for authenticators with non-incrementing counters. **Fixed** with a MongoDB challenge record, atomic one-time consumption and TTL cleanup.
2. Production WebAuthn RP ID/origin were previously derived directly from the incoming request host. **Fixed** by pinning production values with `GRACE_ADMIN_RP_ID` and `GRACE_ADMIN_ORIGIN`; production now fails closed when they are absent.
3. Appointment bearer-token API responses did not explicitly disable caching. **Fixed** with `Cache-Control: private, no-store`.
4. The application lacked a baseline set of browser security headers. **Fixed** with MIME-sniffing, clickjacking, referrer, Permissions-Policy, basic CSP restrictions, HSTS in production, and removal of `X-Powered-By`.
5. Admin session/OAuth/challenge cookies were not using host-only `__Host-` names. **Fixed**.
6. Newly generated admin password hashes used a weaker scrypt work factor than current OWASP guidance and password changes did not enforce a meaningful length policy. **Fixed for newly generated/changed passwords**; legacy hashes remain verifiable for recovery compatibility and should be rotated.

No evidence was found in the reviewed architecture of a direct public-to-admin privilege escalation path. Admin APIs consistently use server-side authorization, MongoDB remains the authoritative booking state, and Google Calendar is treated as an external integration rather than the booking authority.

**Overall assessment:** the application has a strong security architecture for its current single-therapist scope after the 16C remediations, but it should **not yet be described as formally penetration-tested or compliance-certified**. Production deployment remains gated on configuration validation, automated security/lifecycle testing, and an external runtime assessment if the risk profile requires one.

## 2. Scope

Reviewed source areas included:

- `lib/admin/auth.ts`
- `lib/admin/passkeys.ts`
- `lib/admin/setup-auth.ts`
- Admin authentication and passkey API routes
- `app/admin/layout.tsx`
- `app/api/admin/**`
- `lib/appointments/appointment-repository.ts`
- `lib/appointments/appointment-service.ts`
- `app/api/appointments/[confirmationToken]/route.ts`
- `app/api/appointments/[confirmationToken]/ics/route.ts`
- Google Calendar crypto/config/service/repository paths
- CMS profile/draft/public isolation paths
- `next.config.ts`
- `.env.example`
- `scripts/generate-admin-password-hash.mjs`
- `package.json`
- `PROJECT_MAP.md`

The review also considered the architecture represented by the repository: MongoDB booking locks, revision-driven realtime synchronization, Google Calendar OAuth/event projection, GridFS profile media, and the public/admin route split.

## 3. Threat model summary

### Primary assets

- Therapist/admin account access
- Admin session cookie
- WebAuthn credentials and credential metadata
- Google OAuth refresh token
- Google Calendar access and event projection
- Patient name/email and appointment details
- Appointment confirmation bearer tokens
- Booking state and booking locks
- Private profile drafts/media
- Deployment secrets

### Primary trust boundaries

1. Public browser → public Next.js routes/API
2. Admin browser → protected admin routes/API
3. Browser → WebAuthn authenticator
4. Application → MongoDB
5. Application → Google OAuth/Calendar APIs
6. Deployment environment → application secrets

### Security objectives

- Prevent unauthenticated admin access.
- Prevent public users from reaching private CMS/admin data.
- Prevent passkey challenge replay and RP/origin confusion.
- Preserve booking atomicity and avoid double booking.
- Keep Google refresh tokens out of clients and encrypted at rest.
- Minimize accidental persistence/caching of patient appointment data.
- Prevent browser-side framing, MIME confusion and excessive referrer leakage.
- Fail closed when production security configuration is missing.

## 4. Findings and remediation

### SEC-16C-001 — WebAuthn challenge was not server-side single-use

**Severity:** High  
**Status:** Fixed  
**Affected:** `lib/admin/passkeys.ts`

**Observation:** The original implementation stored the WebAuthn challenge in a signed cookie. The cookie was deleted only after successful verification, meaning a valid challenge could remain usable across failed verification attempts and concurrent requests until expiry. Authenticator counters are not sufficient as the sole replay defense because some authenticators legitimately report a non-incrementing counter.

**Risk:** A captured valid WebAuthn response/challenge pair could have had a larger replay window than intended, particularly around concurrent requests.

**Remediation:**
- Added `admin_passkey_challenges` MongoDB collection.
- Added 5-minute expiration.
- Added TTL index on `expiresAt`.
- Challenge is bound to a random server-side nonce and a signed HttpOnly cookie.
- Verification uses `findOneAndDelete()` with nonce, challenge, action and expiry predicates, making challenge consumption one-time at the database boundary.
- Cookie is deleted regardless of verification outcome.

### SEC-16C-002 — Production WebAuthn RP ID/origin trusted the request host

**Severity:** High  
**Status:** Fixed  
**Affected:** `lib/admin/passkeys.ts`, `.env.example`

**Observation:** The previous implementation derived `rpID` and `origin` directly from the request URL. This is convenient for development and previews but is not a strong production trust boundary if host/origin routing is misconfigured.

**Risk:** A deployment with unexpected host aliases, proxy behavior or host-header exposure could bind WebAuthn verification to an unintended origin.

**Remediation:**
- Added `GRACE_ADMIN_ORIGIN` and `GRACE_ADMIN_RP_ID`.
- Production passkey operations fail closed unless both are configured.
- Development retains request-host derivation so local WebAuthn continues to work across localhost/loopback development ports.
- Production deployment documentation must set the exact HTTPS origin and RP ID.

### SEC-16C-003 — Appointment bearer-token responses lacked explicit no-store control

**Severity:** Medium  
**Status:** Fixed  
**Affected:** `app/api/appointments/[confirmationToken]/route.ts`

**Observation:** Appointment management is intentionally bearer-token based, but the JSON API did not explicitly instruct browsers/proxies not to cache the response.

**Risk:** A bearer token is effectively a capability. Cached appointment responses can unnecessarily extend the exposure window of patient name, email and appointment details.

**Remediation:** All GET/PATCH/DELETE responses from the appointment bearer-token API now use `Cache-Control: private, no-store`. ICS already used `private, no-store`.

### SEC-16C-004 — Missing baseline browser security headers

**Severity:** Medium  
**Status:** Fixed  
**Affected:** `next.config.ts`

**Observation:** `next.config.ts` previously contained no application-level security response headers.

**Remediation:** Added:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- restrictive `Permissions-Policy`
- baseline CSP restrictions: `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'`, `form-action 'self'`
- production HSTS: `max-age=63072000; includeSubDomains`
- `poweredByHeader: false`

A full nonce-based strict CSP was **not** introduced blindly because Next.js application scripts and future third-party integrations require a tested nonce architecture. The current CSP is defense-in-depth, not a claim of complete XSS prevention.

### SEC-16C-005 — Admin/session/OAuth cookies lacked `__Host-` prefix

**Severity:** Medium  
**Status:** Fixed  
**Affected:** `lib/admin/auth.ts`, `lib/admin/passkeys.ts`, `lib/admin/setup-auth.ts`

**Observation:** Cookies were Secure/HttpOnly/SameSite controlled but used ordinary names.

**Risk:** A host-only cookie is a stronger deployment boundary than a normal cookie name because the `__Host-` prefix requires Secure, path `/`, and no Domain attribute.

**Remediation:**
- `grace_admin_session` → `__Host-grace_admin_session`
- `grace_admin_passkey_challenge` → `__Host-grace_admin_passkey_challenge`
- `grace_google_calendar_oauth_state` → `__Host-grace_google_calendar_oauth_state`

Existing sessions will naturally require re-authentication after the cookie-name change.

### SEC-16C-006 — New admin password hashes used a lower scrypt work factor and password changes lacked length enforcement

**Severity:** Medium  
**Status:** Fixed for new/changed passwords; legacy hashes retained for compatibility  
**Affected:** `lib/admin/auth.ts`, `scripts/generate-admin-password-hash.mjs`, `app/api/admin/auth/password/route.ts`

**Observation:** Existing generation used scrypt `N=16384,r=8,p=1`. Current OWASP guidance lists stronger scrypt configurations as the recommended minimum range depending on the memory/parallelism tradeoff. Password changes also accepted arbitrarily short passwords.

**Remediation:**
- New generated/changed passwords use scrypt `N=32768,r=8,p=2` with 64-byte output and random 16-byte salt.
- New password changes require 15–128 characters.
- Password verification remains compatible with existing hashes to avoid lockout during deployment.
- The project should rotate the current production password through the authenticated password-change flow after deployment if the current stored hash predates this policy.

### SEC-16C-007 — Passkey credential lookup lacked an explicit unique credential index

**Severity:** Low/Medium  
**Status:** Fixed  
**Affected:** `lib/admin/passkeys.ts`

**Remediation:** Added a unique `credentialId` index and `userId` lookup index to `admin_passkeys`. This makes credential identity an explicit database invariant instead of relying only on application behavior.

## 5. Areas that passed review

### Authentication and authorization

- `/admin/*` is protected by `app/admin/layout.tsx` and `isAdminAuthenticated()`.
- Sensitive admin APIs independently call `requireAdminSession()`.
- Public pages do not depend on admin authentication.
- No public therapist signup/account-creation flow exists.
- Password and passkey authentication converge on the existing signed admin session rather than creating a second application session architecture.

### Session lifecycle

- Session has a bounded 8-hour lifetime.
- Session signature uses HMAC-SHA256.
- Random nonce prevents deterministic session values.
- Future issuance timestamps beyond a one-minute tolerance are rejected.
- Password-hash credential version invalidates sessions after password rotation.
- Logout deletes the session cookie.

### Password storage

- Passwords are not stored plaintext.
- scrypt is used with random salts.
- Password hash comparison uses `timingSafeEqual()`.
- Password hashes are never sent to clients.

### WebAuthn

- User verification is required.
- Discoverable credentials are required for usernameless passkey login.
- Challenge lifetime is bounded.
- Challenge state is now server-side and single-use.
- RP ID and origin are explicitly verified by SimpleWebAuthn.
- Private key material remains on the authenticator.
- Credential counters are persisted and updated with a concurrency predicate.

SimpleWebAuthn's documented model requires an RP ID/origin to be supplied and the challenge to be remembered for verification; the implementation now follows that model with explicit production configuration and server-side challenge state. citeturn3search0turn3search2

### Public/private isolation

The audit found the intended isolation pattern consistently represented in the repository: admin pages are protected at the route layout, and admin APIs independently authorize requests. Profile drafts and draft media remain private. This matches the architecture recorded in `PROJECT_MAP.md`. fileciteturn93file0

### Appointment concurrency

The booking engine retains MongoDB booking locks and transactional writes. The 16C changes did not introduce a second scheduling path or weaken MongoDB authority.

### Google OAuth and token storage

- OAuth state is random, signed, time-limited and consumed once.
- Google refresh tokens are encrypted with AES-256-GCM before MongoDB storage.
- Google Calendar authentication is separate from admin authentication.
- Calendar failures do not replace MongoDB as appointment authority.

### Error handling

Reviewed appointment/authentication routes generally return application-level errors rather than raw database objects. Calendar sync errors persisted for therapist troubleshooting are truncated to 500 characters before storage in appointment sync state.

### Security headers

The implemented headers follow the type of browser-level defenses recommended by OWASP, including `nosniff`, clickjacking protection, referrer policy, HSTS and cache controls for sensitive responses. citeturn0search0turn0search1turn0search5

## 6. Residual risks / accepted limitations

### RES-16C-001 — No full strict nonce-based CSP

**Severity:** Medium hardening gap  

The application now has useful CSP restrictions, but not a complete nonce-based `script-src` policy. A strict CSP should be introduced only after testing the complete Next.js runtime and any future Google/Calendar integrations. OWASP explicitly notes that CSP configuration is application-specific and recommends strict nonce/hash approaches when practical. citeturn0search3

### RES-16C-002 — IP rate-limit identity depends on deployment proxy behavior

**Severity:** Low/Medium operational risk

The password login limiter derives an address from `x-forwarded-for`/`x-real-ip`. In the intended Vercel deployment, these headers are supplied by the trusted edge. If the application is ever deployed behind an untrusted/custom proxy, proxy header normalization must be verified before treating the header as a security boundary.

### RES-16C-003 — Password rate limiting is defense-in-depth rather than a complete distributed anti-brute-force system

**Severity:** Low for current single-admin scope

The application uses MongoDB-backed rate-limit records, but there is no dedicated WAF/bot-management service, global distributed reputation system, or external identity provider. This is intentional to avoid paid infrastructure. Passkeys substantially reduce the practical password attack surface once enabled.

### RES-16C-004 — Appointment confirmation tokens remain bearer capabilities

**Severity:** Medium by design

Anyone possessing a valid appointment confirmation token can access the patient-facing appointment management capability allowed by policy. This is the intended no-account architecture. The token must therefore remain high-entropy, must not be logged, and must not be embedded into analytics/tracking URLs. The new `no-store` and `no-referrer` controls reduce accidental browser/proxy leakage but do not change the bearer-token trust model.

### RES-16C-005 — No automated security regression suite yet

**Severity:** Medium process risk

Phase 18 is still planned. 16C validates the architecture and source-level controls, but there is not yet a committed automated suite covering session tampering, challenge replay, authorization matrix, token handling, booking races and API abuse. This is a remaining production-readiness task.

### RES-16C-006 — No independent runtime penetration test

**Severity:** Process limitation

This audit is not a substitute for an external penetration test. For the current small single-therapist deployment, source review plus automated testing is a reasonable engineering baseline, but an external assessment remains the appropriate next step if the deployment later handles a larger patient population, regulated data, multiple administrators or contractual compliance requirements.

## 7. Verification status

### Source-level verification performed

- Latest `main` inspected before remediation.
- Admin authentication implementation inspected.
- Passkey implementation and all passkey routes inspected.
- Public appointment bearer-token paths inspected.
- Appointment repository/service and Mongo booking-lock architecture inspected.
- Google OAuth state and refresh-token encryption inspected.
- `.env.example`, password hash generator and package manifest inspected.
- Security-header configuration inspected.
- `PROJECT_MAP.md` synchronized with the 16C architecture/remediation.

### Runtime/build verification limitation

The current tool environment could not clone/install the repository because outbound GitHub DNS/network access from the execution container was unavailable. Therefore the following commands were **not honestly claimable as executed by this audit session**:

```text
npm run lint
npx tsc --noEmit
npm run build
git diff --check
npm audit
```

They remain mandatory before the project is declared production-ready. This limitation is intentionally recorded rather than hidden.

The project owner should run the above commands from a normal development environment after pulling the 16C commits. Any compile/lint issue found there should be treated as a release blocker until resolved.

## 8. Recommended security test cases for Phase 18

1. Forge/tamper `__Host-grace_admin_session` and confirm rejection.
2. Modify session issuance time, username, credential version, nonce and HMAC independently.
3. Confirm password change invalidates the old session.
4. Replay a previously successful WebAuthn assertion and confirm rejection.
5. Submit the same WebAuthn verification concurrently and confirm only one challenge can be consumed.
6. Submit a challenge after five minutes and confirm rejection.
7. Attempt registration without an admin session.
8. Attempt admin API calls without a session.
9. Attempt access to draft profile data from public routes.
10. Attempt appointment token enumeration and confirm rate/entropy assumptions.
11. Confirm appointment API responses contain `Cache-Control: private, no-store`.
12. Verify Google OAuth callback rejects missing, expired and mismatched state.
13. Verify malformed encrypted Google refresh tokens fail closed.
14. Exercise booking concurrency with identical slots and confirm only one booking succeeds.
15. Confirm Google Calendar failure never causes MongoDB appointment state to be rolled back incorrectly.
16. Validate production WebAuthn fails closed when RP ID/origin configuration is absent.
17. Validate production WebAuthn rejects an unexpected origin/host.
18. Validate all production cookies are Secure/HttpOnly/SameSite as intended.
19. Validate HSTS is present only on HTTPS production responses.
20. Run dependency and build checks as part of CI before deployment.

## 9. Release recommendation

**Security engineering recommendation: CONDITIONALLY READY FOR NEXT TESTING PHASE, NOT YET PRODUCTION-CERTIFIED.**

The major source-level 16C issues identified in this audit have been remediated without changing the core scheduling architecture. The remaining blockers are validation and operational rather than a known critical design flaw:

1. Run lint/typecheck/build/diff/audit locally.
2. Add and execute Phase 18 automated security/lifecycle regression tests.
3. Set and verify production `GRACE_ADMIN_ORIGIN` and `GRACE_ADMIN_RP_ID`.
4. Verify all production secrets are injected through the deployment platform and not committed.
5. Rotate the admin password through the authenticated password-change path if the currently deployed password hash predates the stronger scrypt policy.
6. Perform production smoke/security testing after deployment.
7. Consider an independent penetration test if the deployment risk profile warrants it.

## 10. References

- OWASP HTTP Headers Cheat Sheet — browser security headers, cache controls and HSTS. citeturn0search0turn0search1
- OWASP Transport Layer Security Cheat Sheet — TLS/HSTS and sensitive-response cache guidance. citeturn0search5
- OWASP Password Storage Cheat Sheet — scrypt work factors and password storage guidance. citeturn1search0
- OWASP Authentication Cheat Sheet — password length and authentication controls. citeturn1search2
- SimpleWebAuthn server documentation — RP ID/origin, challenge storage and credential counter responsibilities. citeturn3search0
- SimpleWebAuthn passkey documentation — discoverable credentials and user verification. citeturn3search3

---

**Audit conclusion:** Phase 16C source-level security/privacy review and remediation is complete. Runtime validation and automated security testing remain required before the project is labeled production-ready.

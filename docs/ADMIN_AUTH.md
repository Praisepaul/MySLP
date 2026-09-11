# Grace Sessions admin authentication

The public therapist website and private therapist workspace are intentionally isolated.

## Private workspace

- Admin route: `/admin`
- Login route: `/admin-login`
- No public registration flow exists.
- The complete `/admin/*` route tree requires a valid therapist session.
- Every admin API performs its own server-side admin-session check.
- Draft profile content and draft profile images remain private.
- The public profile never links to the admin workspace.

The admin logo stays inside the private workspace and returns to `/admin`. The public site keeps its own public navigation.

## Credentials

Set these server environment variables:

- `GRACE_ADMIN_USERNAME` — defaults to `gracevpaul` when omitted.
- `GRACE_ADMIN_PASSWORD_HASH` — generated from the password, never store the plaintext password in source control.
- `GRACE_ADMIN_SESSION_SECRET` — long random secret, at least 32 characters.

Generate a password hash locally with:

```text
npm run admin:hash-password
```

Paste the generated `GRACE_ADMIN_PASSWORD_HASH=...` value into the deployment environment, not into the repository.

## Sessions

The therapist session is an HttpOnly, signed cookie with an 8-hour lifetime. It uses `SameSite=Lax` so the authenticated Google OAuth callback can complete safely. The session includes a credential-version fingerprint, so changing the configured password hash invalidates existing sessions after the next request.

Logout deletes the session cookie.

## Login abuse protection

Failed password attempts are rate-limited with a MongoDB-backed short-lived record. The rate-limit key is a SHA-256 digest and does not store the raw client IP address. The collection is `admin_login_rate_limits` and uses a TTL index for cleanup.

## Google Calendar

The old temporary setup-key gate has been removed. Google Calendar actions now require the same authenticated therapist session as the rest of the admin workspace.

Google OAuth state still uses its own short-lived signed cookie and a separate `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`.

## Passkeys

Passkeys/WebAuthn are intentionally the next authentication enhancement, not a substitute for the password foundation. Once password authentication is validated in production-like testing, passkeys can be enrolled as the preferred sign-in method while retaining the password as a recovery path.

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

## Therapist account menu

Clicking the therapist avatar in the admin top bar opens the private account menu. It provides:

- Change profile photo
- Change password
- Log out

The profile photo uses the existing therapist profile-image GridFS flow, so there is no second image-storage system. The uploaded photo is saved to the private profile draft and therefore follows the existing explicit profile-publish workflow for the public website.

## Credentials

Set these server environment variables:

- `GRACE_ADMIN_USERNAME` — defaults to `gracevpaul` when omitted.
- `GRACE_ADMIN_PASSWORD_HASH` — bootstrap password hash; never store the plaintext password in source control.
- `GRACE_ADMIN_SESSION_SECRET` — long random secret, at least 32 characters.

Generate the initial password hash locally with:

```text
npm run admin:hash-password
```

Paste the generated `GRACE_ADMIN_PASSWORD_HASH=...` value into the deployment environment, not into the repository.

### Password changes

After the therapist changes the password from the account menu, the new scrypt hash is stored in MongoDB in the `admin_credentials` collection under `_id: "admin"`. The MongoDB value becomes the active password hash; the environment hash remains the bootstrap/fallback credential for an installation that has not yet created the MongoDB credential record. MongoDB's `updateOne(..., { upsert: true })` pattern updates the existing credential record or creates it when needed. citeturn1search0turn1search2

The current password is required before a new password can be saved. A new password must contain at least 12 characters and must differ from the current password. The password itself is never stored in MongoDB — only the scrypt hash is stored.

Changing the password also changes the credential-version fingerprint used by the signed session. The current browser session is immediately re-issued against the new credential version, while older sessions become invalid.

## Sessions

The therapist session is an HttpOnly, signed cookie with an 8-hour lifetime. It uses `SameSite=Lax` so the authenticated Google OAuth callback can complete safely. The session includes a credential-version fingerprint, so changing the active password hash invalidates older sessions.

Logout deletes the session cookie.

## Login abuse protection

Failed password attempts are rate-limited with a MongoDB-backed short-lived record. The rate-limit key is a SHA-256 digest and does not store the raw client IP address. The collection is `admin_login_rate_limits` and uses a TTL index for cleanup.

## Google Calendar

The old temporary setup-key gate has been removed. Google Calendar actions now require the same authenticated therapist session as the rest of the admin workspace.

Google OAuth state still uses its own short-lived signed cookie and a separate `GOOGLE_CALENDAR_OAUTH_STATE_SECRET`.

## Passkeys

Passkeys/WebAuthn are intentionally the next authentication enhancement, not a substitute for the password foundation. Once password authentication is validated in production-like testing, passkeys can be enrolled as the preferred sign-in method while retaining the password as a recovery path.

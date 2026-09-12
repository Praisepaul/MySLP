# Environment Contract

All secrets are server-side. Never expose these through `NEXT_PUBLIC_*` variables or commit them to Git.

## MongoDB

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | No | Database name; defaults to `MySLP` |

## Google Calendar

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_CALENDAR_CLIENT_ID` | Calendar | Google OAuth client ID |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Calendar | Google OAuth client secret |
| `GOOGLE_CALENDAR_REDIRECT_URI` | Calendar | Exact OAuth callback URI |
| `GOOGLE_CALENDAR_THERAPIST_EMAIL` | Calendar | Calendar owner/participant email |
| `GOOGLE_CALENDAR_OAUTH_STATE_SECRET` | Calendar | Signs short-lived OAuth state |
| `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY` | Calendar | Encrypts stored refresh credentials |

Required OAuth scopes are `calendar.freebusy` and `calendar.events`.

Production callback:

`https://myslp-delta.vercel.app/api/admin/google-calendar/callback`

Local callback:

`http://localhost:3000/api/admin/google-calendar/callback`

## Admin authentication

| Variable | Required | Purpose |
|---|---|---|
| `GRACE_ADMIN_USERNAME` | Yes | Pre-created admin username |
| `GRACE_ADMIN_PASSWORD_HASH` | Yes | scrypt password hash |
| `GRACE_ADMIN_SESSION_SECRET` | Yes | Signs admin session |

Generate the password hash locally with `npm run admin:hash-password`.

Passwords are 15–128 characters; current generated hashes use scrypt `N=32768`, `r=8`, `p=2`, 64-byte output and 16-byte salt.

## WebAuthn

| Variable | Required | Purpose |
|---|---|---|
| `GRACE_ADMIN_ORIGIN` | Production | Exact WebAuthn origin |
| `GRACE_ADMIN_RP_ID` | Production | WebAuthn relying-party ID |

Current production values are the production origin and `myslp-delta.vercel.app` RP ID. Local development should use matching local values when performing passkey ceremonies.

## Secret handling

- Keep `.env.local` outside source control.
- Rotate secrets deliberately; some values must remain stable to decrypt existing data or validate existing sessions.
- Never paste production credentials into issues, PRs, logs or documentation.
- If a secret is exposed, rotate it before continuing development.
- Treat the Google token encryption key as data-loss-sensitive: changing it without a migration strategy can make stored refresh credentials undecryptable.

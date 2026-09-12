# Operations Runbook

## First principle

Preserve MongoDB appointment state. Investigate external integration failures separately.

## MongoDB connectivity incident

Symptoms can include intermittent server-rendering failures, `MongoServerSelectionError`, `ReplicaSetNoPrimary`, handshake/reset-pool errors, or transient Atlas overload/network messages.

Actions:

1. Check MongoDB Atlas health and network/access configuration.
2. Check Vercel runtime logs for connection topology errors.
3. Confirm `MONGODB_URI` is unchanged and valid.
4. Confirm the application is using the current `lib/db/mongodb.ts` lifecycle.
5. Avoid adding manual retry loops during an incident.
6. Retry a controlled request after Atlas recovers.

The connection boundary intentionally clears failed initial promises so warm serverless contexts can recover.

## Google Calendar incident

Symptoms include free/busy errors, event projection failures, expired OAuth connection, or missing Meet data.

Actions:

1. Preserve the MongoDB appointment.
2. Check the Calendar connection status in admin.
3. Check OAuth credentials/consent and redirect URI.
4. Inspect Calendar-specific logs without exposing tokens.
5. Reconnect Calendar if credentials are invalid.
6. Reconcile the external event after application state is confirmed.

Never solve a Calendar failure by deleting a valid appointment from MongoDB.

## Realtime refresh incident

If users report stale availability:

1. Confirm the relevant MongoDB write actually succeeded.
2. Confirm the corresponding revision document changed.
3. Check `/api/availability/revision` or the admin appointment revision route.
4. Confirm the browser is active and not blocked by an extension/network layer.
5. Confirm the UI is still using Mongo-only revision polling.

Do not increase polling frequency or introduce Google polling as the first response.

## Authentication incident

If admin login fails:

1. Verify `GRACE_ADMIN_*` configuration.
2. Check whether the password hash was recently rotated.
3. Check MongoDB login-rate-limit state if repeated failures occurred.
4. For passkeys, verify `GRACE_ADMIN_ORIGIN` and `GRACE_ADMIN_RP_ID` exactly match production.
5. Never disable server-side authorization to restore access.

## Secret exposure

If a secret is exposed:

1. Rotate/revoke it immediately.
2. Determine whether sessions, OAuth credentials or encrypted data are affected.
3. Invalidate admin sessions where appropriate.
4. Reconnect Calendar if its credentials are affected.
5. Remove the secret from source/history through an appropriate credential-remediation process.
6. Document the incident.

## Booking conflict report

When a user reports that a slot was incorrectly shown or rejected:

1. Record the approximate appointment time and service.
2. Inspect MongoDB appointment/lock state.
3. Inspect persisted availability and booking settings.
4. Inspect external Calendar busy/free state if relevant.
5. Determine whether the conflict came from application state, external schedule, or stale client data.
6. Do not patch the UI to bypass server-side validation.

## Production logging rule

Logs must be useful without becoming a secret store. Never log passwords, session cookies, OAuth codes/tokens, confirmation tokens, MongoDB URIs, or encryption keys.

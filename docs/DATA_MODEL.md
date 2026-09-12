# MongoDB Data Model

MongoDB is the authoritative store for application state.

## Collections

| Collection | Responsibility |
|---|---|
| `appointments` | Appointment lifecycle and public/admin appointment state |
| `appointment_booking_locks` | Short-lived booking concurrency protection |
| `google_calendar_connections` | Connected Calendar configuration/credentials metadata |
| `google_calendar_busy_cache` | Calendar busy/free integration cache |
| `google_calendar_discovered_conflicts` | Discovered external scheduling conflicts |
| `availability_revisions` | Public booking revision singleton |
| `appointment_revisions` | Admin appointment revision singleton |
| `admin_login_rate_limits` | Login throttling state |
| `admin_credentials` | Admin/passkey credential state |
| `admin_passkeys` | WebAuthn credentials |
| `admin_passkey_challenges` | Short-lived WebAuthn challenges with TTL |
| `site_settings` | Therapist/profile and persisted settings |
| `cms_services` | Bookable service definitions |
| `cms_availability` | Persisted therapist availability |
| `profile_media.files` | GridFS profile media metadata |
| `profile_media.chunks` | GridFS binary chunks |

## Appointment invariants

- Appointment identity is server-generated.
- Idempotency is checked before creating a duplicate appointment.
- Active overlap queries protect against conflicting schedules.
- Booking locks protect the critical concurrency window.
- Google synchronization state is tracked separately from appointment existence.
- Google failure never removes the Mongo appointment.

## Revision invariants

Revision documents are singleton state markers, not business records. A successful relevant application write increments the marker so clients can cheaply detect that their current view may be stale.

The browser should not infer appointment details from a revision value. It must fetch the authoritative application data after a revision change.

## Calendar identity invariants

`googleCalendarConnectionId` points to the application's Mongo connection record. `googleCalendarId` is the external Google Calendar identifier. They are not interchangeable.

## CMS invariants

Persisted configuration overrides static fallback after initialization. Draft content is private; publishing is explicit. Public endpoints return only published/public projections.

## Indexing

Appointment indexes are established through `ensureAppointmentIndexes()` in `lib/appointments/appointment-repository.ts`. Booking-related queries should use the existing repository/index strategy rather than introducing ad-hoc collection scans.

## Retention and deletion

Retention behavior is governed by the application lifecycle and public legal policies. TTL collections are used for short-lived operational state such as WebAuthn challenges. Do not add indefinite retention for ephemeral security material.

Any schema change must consider existing production documents, indexes, rollback behavior, and privacy/legal commitments.

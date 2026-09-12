# API Surface

The API is implemented through Next.js App Router route handlers under `app/api`.

## Public APIs

| Route | Purpose |
|---|---|
| `/api/availability` | Return bookable availability |
| `/api/availability/revision` | Return public availability revision |
| `/api/appointments` | Create appointments through the booking service |
| `/api/appointments/revision` | Return appointment revision state |
| `/api/appointments/[confirmationToken]` | Read/manage an appointment capability |
| `/api/appointments/[confirmationToken]/ics` | Export appointment as ICS |
| `/api/profile/image` | Public profile image projection |

Public APIs must not require an admin session and must not expose private drafts.

## Admin APIs

Admin route handlers cover authentication, passkeys, profile/CMS, availability, booking settings, services, appointments, Calendar OAuth and Calendar operations. Sensitive handlers must authenticate using the existing admin session boundary.

Examples of protected domains include:

- `/api/admin/auth/*`
- `/api/admin/profile/*`
- `/api/admin/appointments/*`
- `/api/admin/availability/*`
- `/api/admin/services/*`
- `/api/admin/booking-settings/*`
- `/api/admin/google-calendar/*`

The exact route files under `app/api/admin/` are the implementation source of truth.

## Appointment capability contract

Confirmation-token endpoints are bearer-capability endpoints. Possession of the token is authorization for that appointment scope. Responses must use `private, no-store` caching semantics.

Do not expose confirmation tokens to analytics, logs, client telemetry or third-party URLs.

## Booking contract

Appointment creation must flow through `createAppointment()` in `lib/appointments/appointment-service.ts` and the existing booking/lock/conflict architecture. Route handlers must not implement a second booking algorithm.

## Revision contract

Revision endpoints are intentionally cheap. A revision value tells the client that application state may have changed; it does not contain the full appointment or availability payload.

## Error handling

Domain failures should be translated to stable HTTP responses at the route boundary. Do not expose stack traces, credentials, provider tokens or internal connection strings.

`AppointmentBookingError` is the expected domain error for appointment lifecycle failures.

## Cache rules

Public capability data is private. Revision endpoints should be non-stale for the current client. Admin APIs must not be publicly cacheable.

## API evolution rules

- Preserve existing route semantics unless a breaking change is intentional.
- Keep domain logic out of route handlers.
- Validate untrusted input at the server boundary.
- Update documentation when adding/removing a route.
- Update `PROJECT_MAP.md` for architectural API changes.

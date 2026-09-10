# Phase 10 — Therapist Google Calendar Events, Google Meet, and Rescheduling

## Status

Calendar event creation/cancellation was implemented and locally E2E validated. The current Phase 10 enhancement adds automatic Google Meet generation, required guest notifications, and appointment rescheduling. Final local validation of these new paths remains pending.

## Goal

A Grace Sessions appointment should behave as one coherent scheduling object across MongoDB, the therapist's Google Calendar, and Google Meet.

For online appointments:

```text
Patient books
  ↓
MongoDB appointment committed
  ↓
Google Calendar event created
  ↓
Google Meet conference requested
  ↓
Patient + therapist are required guests
  ↓
Google Calendar sends event notification emails
```

On reschedule:

```text
Patient selects a new available slot
  ↓
Server revalidates MongoDB + live Google Calendar
  ↓
MongoDB locks and appointment move transactionally
  ↓
Existing Google Calendar event is updated
  ↓
Existing Meet conference remains attached
  ↓
Google Calendar sends update notifications
```

On cancellation:

```text
MongoDB cancellation + lock release
  ↓
Google Calendar event deletion
  ↓
Google Calendar sends cancellation notification
```

## Architecture

- MongoDB remains the authoritative application booking store.
- The therapist's Google Calendar is an external calendar projection.
- Google Meet is attached to the therapist's Google Calendar event through Calendar `conferenceData`.
- Patient calendar support remains provider-neutral and does not require patient OAuth.
- Final booking and rescheduling validation remain fail-closed.
- Google event creation/update/deletion happens outside the MongoDB transaction.
- If Google projection fails after a MongoDB commit, the appointment remains authoritative and the Google sync status records the failure.

## OAuth scopes

Phase 9 used `calendar.freebusy`. Phase 10 requires `calendar.events` as well.

Current scopes:

- `https://www.googleapis.com/auth/calendar.freebusy`
- `https://www.googleapis.com/auth/calendar.events`

Existing connections must re-authorize after the scope expansion. This was completed during local validation.

## Google Calendar event implementation

File:

- `lib/calendar/google-calendar-event-service.ts`

Functions:

- `createGoogleCalendarAppointmentEvent`
- `updateGoogleCalendarAppointmentEvent`
- `deleteGoogleCalendarAppointmentEvent`

The event ID remains deterministic from the appointment confirmation token to reduce duplicate-event risk after retried requests.

## Google Meet implementation

For online services, event creation sends:

```ts
conferenceData: {
  createRequest: {
    requestId: randomUUID(),
    conferenceSolutionKey: { type: "hangoutsMeet" },
  },
}
```

and:

```ts
conferenceDataVersion: 1
```

Google creates the conference asynchronously. The event service briefly checks the event for the generated video entry point and stores the resulting URL as:

```text
googleMeet.joinUrl
```

If Google has not populated the URL during that short window, the Calendar event remains valid and the conference can finish provisioning asynchronously.

## Required guests and notifications

Environment variable:

```env
GOOGLE_CALENDAR_THERAPIST_EMAIL=
```

The event includes:

- patient email — required attendee
- therapist email — required attendee

Calendar API calls use:

```text
sendUpdates: "all"
```

Therefore Google Calendar handles creation, update, and cancellation notification emails for both participants without introducing a separate transactional email API for the core scheduling lifecycle.

Formspree is intentionally not used as the appointment notification transport. It remains suitable for the contact form. Custom branded transactional email/reminders belong to Phase 15.

## Appointment model

`lib/appointments/appointment-types.ts` now supports:

```ts
googleMeet?: {
  joinUrl?: string;
};
```

`AppointmentPublicView` exposes the Meet join URL so the patient management page can provide a `Join Google Meet` action.

## Appointment rescheduling

Public rescheduling is implemented through:

- `app/appointment/[confirmationToken]/reschedule/page.tsx`
- `components/public/appointments/appointment-reschedule.tsx`
- `app/api/appointments/[confirmationToken]/route.ts` — `PATCH`
- `lib/appointments/appointment-service.ts` — `rescheduleAppointment`

Rescheduling:

1. Validates the confirmation token and future confirmed status.
2. Keeps the existing service and duration.
3. Validates the requested new slot against MongoDB appointments.
4. Performs a live Google Calendar conflict check.
5. Learns newly discovered Google conflicts when applicable.
6. Replaces booking locks transactionally.
7. Updates the appointment schedule.
8. Bumps the public availability revision.
9. Updates the existing Google Calendar event.
10. Preserves the existing Meet conference on that event.
11. Sends Google Calendar update notifications.

The old booking slot remains protected until the MongoDB transaction succeeds.

## Cancellation

`app/api/appointments/[confirmationToken]/route.ts` continues to use `DELETE`.

MongoDB cancellation remains authoritative. If a Google event exists, the event is deleted with `sendUpdates: "all"` so guests receive the cancellation notification.

## Failure handling

MongoDB and Google Calendar do not share an atomic transaction.

If Google event creation/update fails after MongoDB commits:

- the appointment remains confirmed;
- `googleCalendar.syncStatus` becomes `failed`;
- the error is stored for reconciliation;
- the scheduling state is not rolled back.

If cancellation reaches MongoDB successfully but Google deletion fails, the appointment remains cancelled and the event-removal failure is intentionally non-blocking.

## Live availability

The public 3-second revision loop remains MongoDB-only. It never calls Google Calendar.

Availability refreshes use cached Google busy data. Final creation and rescheduling checks use live Google Calendar validation.

## Validation checklist

### Existing Phase 10 validation — completed

- Re-authorized therapist Google connection after scope expansion.
- Created appointment.
- Verified Google Calendar event.
- Verified correct start/end.
- Cancelled appointment.
- Verified Google Calendar event removal.
- Verified MongoDB remains authoritative when Google projection fails.

### New validation to run

- Set `GOOGLE_CALENDAR_THERAPIST_EMAIL` to the therapist's email.
- Book an online appointment.
- Confirm a Google Meet link is generated.
- Confirm the patient and therapist are required guests.
- Confirm creation notification emails are delivered.
- Open the patient appointment management page and verify `Join Google Meet`.
- Reschedule the appointment to another valid slot.
- Confirm the same Google Calendar event moves rather than a duplicate being created.
- Confirm the same Meet link remains attached.
- Confirm guest update notifications are delivered.
- Cancel the rescheduled appointment.
- Confirm the Google event is removed and cancellation notification is delivered.
- Test rescheduling into an occupied MongoDB slot.
- Test rescheduling into a live Google Calendar conflict.
- Test two browsers trying to reschedule/book the same slot.
- Verify the public availability revision updates other browsers within the normal polling window.

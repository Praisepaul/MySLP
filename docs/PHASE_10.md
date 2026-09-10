# Phase 10 — Therapist Google Calendar Events

## Goal

When a patient books a Grace Sessions appointment, create the corresponding event on the therapist's connected Google Calendar.

## Architecture

- MongoDB remains the authoritative application booking store.
- The therapist's Google Calendar is an external calendar projection.
- Public availability continues to use Google Calendar busy/free data.
- Patient calendar support remains provider-neutral: Google Calendar, Apple Calendar, Outlook, and `.ics` are not dependent on therapist OAuth.
- Final booking validation remains fail-closed.
- Google Calendar event creation happens after the MongoDB booking transaction and is not part of that transaction.
- If Google event creation fails after the appointment is committed, the appointment remains confirmed and the failure is recorded for reconciliation.

## OAuth scope

Phase 9 used `calendar.freebusy` for availability. Phase 10 adds `calendar.events` so the therapist can grant event creation/update access. Existing connections must re-authorize after the scope expansion.

## Event lifecycle implemented

1. Validate the requested slot using MongoDB and live Google free/busy.
2. Create the appointment and booking locks transactionally in MongoDB.
3. Bump the public booking revision inside that transaction.
4. After commit, create a deterministic Google Calendar event for the appointment.
5. Persist the event ID and sync status on the appointment.
6. On cancellation, remove the corresponding Google Calendar event when an event ID exists.

## Failure handling

MongoDB and Google Calendar do not share an atomic transaction. A Google failure therefore cannot roll back a committed MongoDB appointment. The appointment remains the authoritative booking, while `googleCalendar.syncStatus` records `synced`, `failed`, or `not_connected` and preserves an error for later reconciliation.

## Live availability

Patient pages use the MongoDB availability revision every 3 seconds while visible. The fast polling endpoint never calls Google Calendar. Availability refreshes use the cached Google free/busy snapshot; final booking still performs the live Google check.

## Validation checklist

- Re-authorize the therapist Google connection after the scope expansion.
- Book an online or in-person appointment.
- Confirm the event appears on the therapist's primary Google Calendar with the correct start/end time.
- Confirm the event contains the Grace Sessions service and patient details.
- Cancel the appointment and confirm the Google event is removed.
- Test a Google Calendar API failure: the MongoDB appointment must remain confirmed and sync status must become `failed`.

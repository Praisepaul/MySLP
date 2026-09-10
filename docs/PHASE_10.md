# Phase 10 — Therapist Google Calendar Events

## Goal

When a patient books a Grace Sessions appointment, create the corresponding event on the therapist's connected Google Calendar.

## Architecture

- MongoDB remains the authoritative application booking store.
- The therapist's Google Calendar is an external calendar projection.
- Public availability continues to use Google Calendar busy/free data.
- Patient calendar support remains provider-neutral: Google Calendar, Apple Calendar, Outlook, and `.ics` are not dependent on therapist OAuth.
- Final booking validation remains fail-closed.
- Google Calendar event creation must not be treated as part of the MongoDB transaction.
- If event creation fails after the appointment is committed, the appointment remains the authoritative booking and the system must expose a safe reconciliation path rather than silently losing the calendar projection.

## OAuth scope

Phase 9 uses `calendar.freebusy` for availability. Phase 10 adds `calendar.events` so the therapist can grant event creation/update access. Existing connections may need to re-authorize after the scope expansion.

## Event lifecycle

1. Validate and create the appointment transactionally in MongoDB.
2. Create the therapist Google Calendar event after the MongoDB transaction commits.
3. Persist the Google Calendar event ID and synchronization status on the appointment.
4. Cancellation/rescheduling will update or remove the external event in the corresponding lifecycle phase.

## Failure handling

MongoDB and Google Calendar do not share an atomic transaction. A Google failure therefore cannot roll back a committed MongoDB appointment. The appointment must remain confirmed, while synchronization status records the failure for retry/reconciliation.

## Live availability

Patient pages use the MongoDB booking-lock revision for rapid change detection. They must not poll Google Calendar directly every few seconds.

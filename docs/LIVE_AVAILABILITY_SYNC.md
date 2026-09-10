# Live availability synchronization

## Decision

Public booking pages refresh availability from MongoDB booking-state changes without polling Google Calendar every few seconds.

The browser checks a lightweight singleton revision every 3 seconds while the booking page is visible. Google Calendar is never queried by this fast revision check.

## Flow

```text
Booking page
  ↓ every 3 seconds while visible
GET /api/availability/revision
  ↓
MongoDB availability_revisions
  ↓ revision changed?
  ├─ no → do nothing
  └─ yes → POST /api/availability
              ↓
        appointments + cached Google Calendar conflicts
              ↓
        new bookable slots
```

## MongoDB revision

The public revision is stored in `availability_revisions` with `_id: public-booking`. Booking creation and cancellation bump the revision inside the same MongoDB transaction as the booking-lock mutation.

The first revision request can fall back to the lock-count/newest-lock calculation so existing deployments can initialize safely.

## Browser behavior

- Polls every 3 seconds while visible.
- Stops polling while hidden.
- Revision checks never call Google Calendar.
- Availability recalculates only after a revision change.
- Final booking validation remains authoritative for concurrency.

## Google Calendar quota protection

The fast polling path is MongoDB-only. It does not continuously query Google Calendar. Availability recalculation uses the existing cached Google free/busy snapshot, and final appointment creation still performs a live Google Calendar check for correctness.

## Phase 10

After the MongoDB appointment transaction commits, the system creates a corresponding therapist Google Calendar event using the expanded `calendar.events` OAuth scope. The event ID and synchronization status are stored on the appointment. Cancellation removes the event when it has been synchronized.

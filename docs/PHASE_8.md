# Phase 8 — Patient calendar support

## Goal

Give patients simple, no-login calendar options immediately after booking and from their appointment management page.

## Implemented

### Calendar links

- `lib/calendar/calendar-links.ts`
  - `getGoogleCalendarUrl`
  - `getOutlookCalendarUrl`

Google Calendar and Outlook use their public event-composer URLs. No patient calendar authorization is required.

### ICS export

- `app/api/appointments/[confirmationToken]/ics/route.ts`
  - `GET`
  - Generates a standards-based `.ics` event from the appointment token.

The event uses UTC `DTSTART`/`DTEND` values so calendar applications can display the appointment correctly in the patient's calendar timezone.

### Public calendar UI

- `components/public/calendar/calendar-actions.tsx`
  - `CalendarActions`

The component provides:

- Google Calendar
- Outlook
- Apple Calendar / `.ics`

The `.ics` file is the cross-platform calendar format used for Apple Calendar and can also be imported by other calendar applications.

### Patient surfaces updated

- `components/public/booking/booking-confirmation.tsx`
- `components/public/appointments/appointment-management.tsx`

Calendar actions appear for confirmed appointments. Cancelled appointments do not expose calendar-add actions.

## Privacy and security

- No patient calendar OAuth flow is introduced.
- Calendar URLs contain only appointment scheduling information.
- ICS access is protected by the existing confirmation token.
- The ICS route returns `Cache-Control: private, no-store`.
- No clinical information is placed in calendar event details.

## Calendar data

Event title:

`Grace Sessions — {service name}`

Event description contains only a short scheduling description and service name.

Start/end values are derived from the stored UTC appointment timestamps.

## Validation

Run locally:

```text
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Manual smoke test:

1. Create a real appointment.
2. Confirm the booking confirmation shows the three calendar options.
3. Open Google Calendar and verify the event date/time.
4. Open Outlook and verify the event date/time.
5. Download the `.ics` file and open/import it with Apple Calendar or another calendar app.
6. Open the appointment management link and verify the same calendar options are present.
7. Cancel the appointment and verify calendar-add actions disappear.

## Next phase

Phase 9 — Therapist Google Calendar integration.

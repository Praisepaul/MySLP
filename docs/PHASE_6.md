# Phase 6 — Patient Booking Experience

Status: **Implemented**

## Public route

- `app/book/page.tsx` — composes the public booking page with the existing public header/footer.

## Booking UI

- `components/public/booking/booking-flow.tsx` — client-side booking journey, timezone detection, upcoming-date calculation and integration with `getBookableSlots`.
- `components/public/booking/booking-service-picker.tsx` — service selection.
- `components/public/booking/booking-date-time-picker.tsx` — timezone selection, date availability and slot selection.
- `components/public/booking/booking-details-form.tsx` — minimal name/email collection with client-side validation.
- `components/public/booking/booking-summary.tsx` — final appointment review and preview completion state.

## Existing files updated

- `app/page.tsx` — homepage booking CTA now routes to `/book`.
- `components/public/profile/profile-services-preview.tsx` — services CTA now routes to `/book`.
- `components/public/navigation/public-header.tsx` — header booking CTA now routes to `/book`.
- `components/public/navigation/mobile-nav.tsx` — mobile navigation now includes the booking CTA.

## Booking flow

```text
Public homepage/header
        ↓
/book
        ↓
Choose service
        ↓
Detect/select timezone
        ↓
Choose date
        ↓
Choose available time
        ↓
Enter name + email
        ↓
Review appointment
        ↓
Preview completion
```

## Domain integration

The UI consumes the existing Phase 5 `getBookableSlots()` boundary rather than duplicating availability logic. The current configuration therefore applies minimum notice, maximum advance, slot interval, buffers, recurring availability and existing booking-domain conflict inputs.

No MongoDB writes, patient account, Google OAuth, Google Calendar connection, email delivery or real appointment creation are introduced in Phase 6. Those responsibilities remain in later phases.

## UX/accessibility decisions

- Four-step progress indicator.
- Keyboard-accessible native controls and buttons.
- Visible focus states inherited from the application design system.
- Mobile-first responsive layouts.
- `aria-live` availability updates.
- Minimal patient information collection.
- Explicit timezone display and manual override.
- Empty, loading and error states.
- Booking confirmation language clearly identifies the current preview boundary so the UI does not falsely imply a persisted appointment.

## Validation note

The implementation was reviewed against the current repository architecture and existing TypeScript APIs. Full local `npm run lint`, `npx tsc --noEmit`, `npm run build` and `git diff --check` execution remains the final validation step on the developer machine because this GitHub session does not provide the repository's local Node dependency environment.

Next phase: **Phase 7 — Appointment management**.

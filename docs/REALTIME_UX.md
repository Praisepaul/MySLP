# Real-time UX architecture

This project treats live UI synchronization as a cross-project requirement, not a page-specific feature.

## Rules

- MongoDB remains the application source of truth.
- Data-changing actions publish a lightweight revision after the authoritative mutation succeeds.
- Open clients check the relevant revision only while their tab is visible.
- A revision check is a cheap MongoDB read; it does not call Google Calendar.
- A changed revision triggers the page's existing data fetch with `cache: "no-store"`.
- Manual Refresh buttons explicitly run that same data fetch/revalidation path.
- Browser refresh/reload is never required for normal appointment changes.
- Do not add high-frequency `setInterval` polling to individual data endpoints.

## Revision channels

### Public availability

Existing `availability_revisions` singleton:

- `_id = "public-booking"`
- checked by `/api/availability/revision`
- public booking slots poll this revision every 3 seconds while visible
- the loop is MongoDB-only and pauses when the tab is hidden
- a changed revision causes `/api/availability` to recalculate slots

### Appointment data

New `appointment_revisions` singleton:

- `_id = "admin-appointments"`
- read by `/api/admin/appointments/revision` for authenticated admin UI
- read by `/api/appointments/revision` for patient appointment-management UI
- clients check every 5 seconds while visible
- the revision is bumped for appointment creation, rescheduling, cancellation, status changes, and Google Calendar sync/Meet projection changes

This lets an admin appointment list, admin dashboard, and a patient's appointment-management page converge automatically without polling the appointment collection itself every few seconds.

## Manual refresh

Relevant data-heavy screens expose an explicit Refresh action. The button reuses the same fetch function used by automatic revalidation; it does not reload the browser.

Current implementations:

- Admin dashboard: `components/admin/dashboard/admin-dashboard.tsx`
- Admin appointments: `components/admin/appointments/admin-appointments-manager.tsx`
- Patient appointment management: `components/public/appointments/appointment-management.tsx`
- Patient booking time slots: `components/public/booking/booking-flow.tsx`

Reusable client synchronization utility:

- `lib/ui/use-data-sync.ts`
- `useDataSync({ revisionUrl, onRefresh, intervalMs })`

## UX requirements

The application is primarily mobile-first, while remaining comfortable on tablets and desktop.

- Primary actions must be obvious and large enough to tap.
- Important actions such as `Join Google Meet` belong near the top of the appointment-management page, not buried below secondary calendar controls.
- Success feedback should be short-lived, accessible, and dismissible.
- Errors must remain understandable and actionable.
- Loading states should prevent duplicate actions without making the whole page feel frozen.
- Automatic synchronization must not steal focus, interrupt typing, or unexpectedly navigate the user.

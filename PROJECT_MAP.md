# Grace Session Scheduler — Project Map

> Authoritative architecture/progress map. `main` is the source of truth. Update this file whenever phases, architecture, filenames or important functions change.

## Product rules
- No patient accounts; no clinical notes.
- MongoDB is authoritative for Grace Sessions appointments and booking state.
- `appointment_booking_locks` is reserved for Grace Sessions concurrency.
- Google Calendar is the therapist-calendar integration/external free-busy signal and event projection.
- `googleCalendarConnectionId` is the Mongo connection identifier (`therapist`); `googleCalendarId` is the Google Calendar API identifier (`primary`).
- Online appointments request Google Meet through Calendar conference data.
- Calendar create/update/delete uses `sendUpdates: all` for current lightweight guest notifications.
- Public availability synchronization is MongoDB-revision driven; the 3-second loop never polls Google.
- Admin should eventually operate the whole product without source-code edits.
- Reuse existing booking, conflict, lock, appointment and calendar services; do not create parallel scheduling logic.
- Time display uses 24-hour `HH:mm` conventions throughout the user/admin scheduling surfaces.
- Timezone selection uses the reusable `components/ui/timezone-select.tsx` component and the runtime IANA timezone list rather than a hardcoded application list.
- Profile CMS fields are optional: the therapist can save/update with any or all profile content blank.
- Public profile presentation is scaffold-driven: CMS content automatically appears in appropriate sections/cards/tags, and empty sections are hidden. The therapist does not need to design page layouts.
- Profile drafts are private and never used by the public homepage. Only explicit publish promotes the draft to the public profile.

## Technology
Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, MongoDB driver/Atlas, Google Calendar API/OAuth, Google Meet via Calendar conferenceData.

## Architecture
```text
PUBLIC
  /                         published therapist profile + automatic profile details/content + services preview
  /book                     persisted services + booking engine
  /appointment/[token]      appointment management
  /appointment/[token]/reschedule
  /api/profile/image        public published therapist profile image stream

ADMIN
  /admin
  /admin/services           persistent Services CMS
  /admin/availability       persistent Availability CMS
  /admin/calendar           responsive therapist schedule + Google Calendar connection
  /admin/appointments
  /admin/profile            persistent Profile CMS + private autosaved draft
  /admin/profile/preview    authenticated full website preview using draft content
  /admin/booking-settings   persistent Booking Settings CMS

SHARED UI
  components/ui/timezone-select.tsx — searchable full IANA timezone input

CMS
  lib/cms/site-settings-repository.ts
    getTherapistProfile() — published profile for public surfaces
    getTherapistProfileDraft() — private admin draft
    saveTherapistProfileDraft() — autosaved draft persistence
    publishTherapistProfile() — explicit draft-to-public promotion
  lib/cms/services-repository.ts
  lib/cms/availability-repository.ts
  components/admin/profile/profile-form.tsx — autosaved draft editor + review/publish preview
  components/admin/profile/profile-content-fields.tsx — quick-add/edit/remove testimonials, FAQs and resources
  components/public/profile/profile-details.tsx — automatic public presentation of optional profile details
  components/public/profile/profile-content.tsx — automatic testimonials/resources presentation
  components/public/profile/profile-faq.tsx — CMS-driven FAQ with safe default FAQ fallback
  app/api/admin/profile/route.ts — draft GET/PUT + explicit publish POST
  app/api/admin/profile/image/route.ts — authenticated draft GridFS profile photo upload/removal
  app/api/profile/image/route.ts — public published image + authenticated draft image preview
  app/admin/profile/preview/page.tsx — authenticated full draft website preview
  MongoDB: site_settings (`therapist-profile` published, `therapist-profile-draft` private draft)
  MongoDB: cms_services
  MongoDB: cms_availability
  MongoDB GridFS bucket: profile_media (`therapist-profile-image` published, `therapist-profile-image-draft` draft)

BOOKING
  lib/booking/slot-types.ts
  lib/booking/time-utils.ts
  lib/booking/availability-engine.ts
  lib/booking/conflict-engine.ts
  lib/booking/slot-engine.ts
  lib/booking/booking-engine.ts
  lib/booking/public-availability-service.ts

APPOINTMENTS
  lib/appointments/appointment-types.ts
  lib/appointments/appointment-repository.ts
  lib/appointments/appointment-service.ts
  components/admin/appointments/admin-appointment-scheduling.tsx — shared admin create/reschedule availability picker

CALENDAR
  lib/calendar/google-calendar-config.ts
  lib/calendar/google-calendar-types.ts
  lib/calendar/google-calendar-crypto.ts
  lib/calendar/google-calendar-repository.ts
  lib/calendar/google-calendar-service.ts
  lib/calendar/google-calendar-event-service.ts
  app/api/admin/calendar/route.ts
  components/admin/calendar/admin-calendar.tsx

MONGO COLLECTIONS
  appointments
  appointment_booking_locks
  google_calendar_connections
  google_calendar_busy_cache
  google_calendar_discovered_conflicts
  availability_revisions
  appointment_revisions
  site_settings
  cms_services
  cms_availability
  profile_media.files / profile_media.chunks (MongoDB GridFS)
```

# Phase status

## Phase 0 — Foundation
**Complete.**

## Phase 1 — Design system + shells
**Complete.** Current CMS/admin button placement and layout are intentionally preserved while functionality is connected.

## Phase 2 — Public therapist profile
**Complete + CMS connected.** Public homepage loads the published `getTherapistProfile()` from `lib/cms/site-settings-repository.ts`, with the original config retained as a safe default. Profile details/content now render through reusable scaffolds so CMS content controls presentation rather than page composition.

## Phase 3 — Services CMS
**Implemented persisted CMS.**

## Phase 4 — Availability management
**Implemented persisted CMS with therapist-focused bulk workflow and calendar view.** The recurring day selector uses compact Sun–Sat circular controls: selected is black/white and unselected is white/black. Availability timezone uses the shared searchable IANA timezone control. Existing approved button placement is preserved. Date-specific changes support full-day unavailable exceptions, partial-day unavailable exceptions, and custom available-hours exceptions.

Files include `components/admin/availability/availability-manager-v2.tsx` and the existing quick-tools/list/form files. No new versioned availability filenames should be introduced going forward.

## Phase 5 — Booking engine
**Complete.** Existing slot/conflict logic remains authoritative. `getBookableSlotsWithConfiguration()` is the reusable runtime configuration boundary; `getBookableSlots()` remains for compatibility/defaults. Availability exceptions are applied inside `lib/booking/availability-engine.ts`, including subtraction of partial-day `unavailable-hours` windows from normal availability.

## Phase 6 — Patient booking experience
**Complete + UI polish.** Service → searchable timezone → date/time → details → review → appointment creation. Booking slot, summary, confirmation, management and reschedule displays now use 24-hour times.

## Phase 7 — Appointment persistence/management
**Complete.** `createAppointment`, `rescheduleAppointment`, `cancelAppointment`, idempotency and transactional booking locks are established. Admin appointment displays now use 24-hour time.

## Phase 8 — Patient calendar support
**Complete.** Google Calendar, Outlook, Apple/ICS support.

## Phase 9 — Therapist Google Calendar
**Complete.** OAuth, encrypted refresh tokens, FreeBusy, cached busy data, manual sync, disconnect and fail-closed final validation.

## Phase 9.1 — Public availability realtime
**Complete.** Mongo-only revision checking every ~3 seconds while visible; Google is not polled by the browser loop.

## Phase 9.2 — External conflict learning
**Complete.** Final Google conflicts can be persisted to `google_calendar_discovered_conflicts` and bump public availability revision.

## Phase 10 — Google Calendar events + Meet
**Complete and end-to-end validated.** Deterministic event projection, update/delete, Google Meet, attendee notifications and public rescheduling are implemented.

## Phase 11 — Admin appointment management + therapist calendar
**Complete.** Admin appointment operations now include list/search/status/date filters, appointment details, Meet access, Calendar sync state, completed/no-show/cancel, live Mongo revision sync, manual Refresh, direct admin appointment creation, native availability-picker rescheduling, and safe Google Calendar retry controls. The `/admin/calendar` tab includes a compact responsive week timeline: desktop/laptop uses smaller rows, compresses empty time gaps between event clusters, and keeps the schedule in an internal scroll region; mobile uses compact chronological day cards inside an internal scroll region. It combines Grace Sessions appointments with Google Calendar events and uses a selected-week fetch rather than continuous Google polling.

Admin scheduling reuses `createAppointment()` / `rescheduleAppointment()`, the existing availability API and booking engine, transactional booking locks, and the existing Google Calendar event service. Google sync retry updates or creates the deterministic event for confirmed appointments and removes the projected event for cancelled appointments without changing Mongo appointment authority.

The temporary setup access gate remains in place. True admin authentication belongs to Phase 16.

## Phase 12 — Profile CMS
**Expanded and complete.** Mongo document: `site_settings`, `_id = therapist-profile` published profile plus `_id = therapist-profile-draft` private working draft. The admin editor covers optional identity, bios, credentials, education/qualifications, professional memberships, specialties/areas of expertise, age groups, populations/who the therapist supports, languages, therapy approach, first-session expectations, assessment/evaluation information, referral requirements, accessibility, insurance/payment information, location/service area, timezone, session types, contact details, social links and a personal “why I became an SLP” note. It also supports optional testimonials, patient FAQs and resources/articles. No profile field is required to save or update the CMS document.

Profile editing is now autosaved to the private draft after a short quiet period. The top of the editor clearly shows draft-save status and provides `Preview draft` and `Review & publish`. The review experience renders the complete website using the draft inside a full-screen responsive preview, with an option to open the full preview in a new tab. `Publish changes` is only available from the review surface, so unfinished content never reaches patients. The public homepage continues to read only the published profile.

List-style profile content uses reusable tag inputs: Enter or comma adds an item, duplicates are avoided, and items can be removed individually. Testimonials, FAQs and resources use quick-add editors: after adding one item, the input resets for the next item while saved entries become editable/removable cards. On the public site, specialties, age groups, populations and languages become polished pills; education/memberships become clean lists; clinical/practical information becomes responsive cards; testimonials become a horizontal snap-scrolling story row; resources become fully clickable responsive cards that open their supplied external link in a new tab; FAQs become CMS-driven cards; and the personal story becomes a dedicated personal-note section. Empty content automatically hides its section. The therapist only supplies content and never has to think about page design.

Profile photo changes are draft-safe too. Draft uploads use `therapist-profile-image-draft`; publishing promotes the draft image to the public `therapist-profile-image`. Direct external image URLs remain compatible. No third-party storage dependency is required.

## Phase 13 — Booking settings CMS
**Implemented initial persisted CMS + runtime enforcement.** Mongo document: `site_settings`, `_id = booking-settings`.

## Phase 14 — Internationalization
**Planned.** English, Portuguese, Hindi across all user-facing surfaces with timezone-aware date/time formatting.

## Phase 15 — Notifications
**Planned.** Custom provider-independent transactional notifications/reminders only where Google Calendar notifications are insufficient.

## Phase 16 — Security/privacy
**Planned.** Replace temporary setup auth, harden tokens/rate limits, validation, secrets, privacy, abuse protection and error redaction.

## Phase 17 — Responsive/accessibility final pass
**Planned.** Mobile/tablet/desktop, keyboard/focus, semantics, contrast, forms, dialogs, calendar and touch targets.

## Phase 18 — Automated testing
**Planned.** Booking/DST/concurrency/lifecycle/Google/API regression suite.

## Phase 19 — Production deployment
**Planned.** Vercel + MongoDB Atlas + Google Cloud OAuth, production secrets/configuration, smoke tests, monitoring and recovery.

## Phase 20 — Handover
**Planned.** Non-technical therapist operating guide covering appointments, services, availability, profile, settings, Calendar, Meet, conflicts and sync failures.

# Current source-of-truth rules
1. `main` is the working branch unless explicitly changed.
2. Inspect latest `main` before every change.
3. Preserve existing filenames/functions/types unless a justified architectural change requires otherwise.
4. MongoDB is authoritative for application booking state.
5. Services are authoritative in `cms_services` once persisted; static service config is fallback only for an uninitialized installation.
6. Availability rules/exceptions are authoritative in `cms_availability` once persisted; static availability config is fallback only for an uninitialized installation.
7. Existing `unavailable` and `custom-hours` exception documents remain valid; `unavailable-hours` is an additive type for blocking only a specific time interval.
8. Never bypass booking validation or booking locks.
9. Google external conflicts belong in `google_calendar_discovered_conflicts`.
10. Never poll Google Calendar from the public revision loop.
11. CMS writes affecting availability bump the existing `availability_revisions` singleton.
12. Profile content is optional and presentation is scaffold-driven; empty sections must not leave awkward blank blocks on the public page.
13. Profile drafts must never be returned by public pages or public profile APIs.
14. Profile publishing is explicit; autosave never publishes.
15. Do not add cron/Redis/Kafka/microservices unless explicitly requested.
16. Do not create `-v2`, `-v3`, `-new` or similar versioned filenames for replacement UI implementations; preserve the canonical file architecture.
17. Profile photos use MongoDB GridFS (`profile_media`) unless a deliberate storage-provider decision is made later.
18. Before production-ready claims, run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check` and relevant lifecycle tests locally.

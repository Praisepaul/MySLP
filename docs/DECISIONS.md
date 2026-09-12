# Architecture Decision Record Summary

This document records decisions that future maintainers should preserve unless there is an explicit architectural review.

## ADR-001 — MongoDB is the booking source of truth

**Decision:** Store appointment state and booking concurrency state in MongoDB.

**Why:** A single authoritative application store makes booking, cancellation, rescheduling and recovery deterministic. Google Calendar is an integration boundary rather than a second transactional database.

**Consequence:** Calendar failures require reconciliation, not appointment deletion.

## ADR-002 — Use dedicated MongoDB booking locks

**Decision:** Protect the booking critical section with `appointment_booking_locks`.

**Why:** Availability shown to a browser can become stale between display and submission. Concurrency must be controlled at the server/database boundary.

## ADR-003 — Mongo revision polling instead of Google polling

**Decision:** Public/admin freshness uses MongoDB revision documents and a roughly three-second browser check while relevant UI is active.

**Why:** Application writes are the event that matters for application state. Polling Google from every browser would add external API pressure without improving authority.

## ADR-004 — Google Calendar projects appointments

**Decision:** Calendar create/update/delete occurs after the application appointment lifecycle is authoritative.

**Why:** External provider availability and application booking state have different failure modes. Keeping them separate makes partial failure recoverable.

## ADR-005 — Lazy shared MongoDB client in serverless runtime

**Decision:** `lib/db/mongodb.ts` caches a successful client and in-flight connection attempt, but removes a failed initial promise.

**Why:** A rejected module-level promise can poison a warm serverless execution context after transient Atlas topology/network failures.

## ADR-006 — Server-side authorization

**Decision:** Every sensitive admin API authenticates independently on the server.

**Why:** UI visibility is not an authorization boundary and direct HTTP requests must be protected.

## ADR-007 — Passkeys are for the pre-created admin

**Decision:** WebAuthn is an admin authentication mechanism, not public account registration.

**Why:** The product does not need patient accounts or open identity enrollment.

## ADR-008 — No separate notification provider

**Decision:** Use Google Calendar/Meet participant notifications rather than introducing an additional email/SMS infrastructure layer.

**Why:** Reduces operational complexity, credentials, vendor dependencies and rate-limit surfaces.

## ADR-009 — English-only product

**Decision:** Internationalization infrastructure is not part of the current product architecture.

**Why:** The current product scope is English-only; adding translation infrastructure without a product requirement would increase maintenance surface.

## ADR-010 — No CI/browser test suite at present

**Decision:** Automated tests and Playwright/CI configuration were removed by project-owner decision.

**Why:** The current workflow favors local lint/build plus deliberate manual lifecycle validation. Reintroduce automation only as an explicit project decision, not incidentally through a feature change.

# Deployment Guide

## Current architecture

Production uses Vercel for the Next.js application, MongoDB Atlas for persistence, and Google Cloud OAuth/Calendar for the calendar integration.

Production URL:

`https://myslp-delta.vercel.app/`

## Pre-deployment checklist

- `main` contains the intended commit.
- `npm run lint` passes locally.
- `npm run build` passes locally.
- Production MongoDB URI/database are configured.
- Admin username/hash/session secret are configured.
- Google OAuth credentials and exact redirect URI are configured if Calendar is enabled.
- `GRACE_ADMIN_ORIGIN` and `GRACE_ADMIN_RP_ID` match the production origin.
- No secrets are present in tracked files.
- Manual booking/admin smoke checks have been completed.

## Google OAuth

Production callback:

`https://myslp-delta.vercel.app/api/admin/google-calendar/callback`

Local callback:

`http://localhost:3000/api/admin/google-calendar/callback`

The Google Cloud OAuth client must contain the exact URI used by the deployment. Do not substitute a trailing slash or alternate host.

## Vercel environment configuration

Set the variables documented in `docs/ENVIRONMENT.md` in the correct Vercel environment. Production secrets should not be copied into preview environments unless deliberately required.

Keep encryption and signing secrets stable across normal deployments. Rotating them can invalidate sessions or make existing encrypted Calendar credentials undecryptable.

## Smoke test after deployment

1. Open the public landing page.
2. Open `/book` and verify services load.
3. Verify availability appears in the expected timezone.
4. Create a controlled appointment.
5. Verify the appointment appears in admin.
6. Verify Google Calendar projection when enabled.
7. Verify online appointment Meet data when applicable.
8. Verify cancellation/rescheduling.
9. Verify `/admin-login` rejects unauthenticated access to `/admin`.
10. Verify passkey login if enabled.
11. Verify public legal pages load.
12. Verify light/dark/system theme switching.

## Rollback

Prefer reverting to the last known-good application commit through the normal Vercel deployment mechanism. Do not roll back MongoDB schema/state blindly with the application: database documents and indexes can outlive a deployment.

For a Calendar incident, preserve MongoDB appointment state and repair/reconcile the external projection rather than deleting valid appointments.

## Deployment principles

- Vercel is the only intended application host in the current architecture.
- MongoDB Atlas remains the authoritative application database.
- Google Calendar remains an integration boundary.
- Public realtime refreshes remain Mongo-only.
- Do not add application-level polling merely to compensate for a deployment issue.

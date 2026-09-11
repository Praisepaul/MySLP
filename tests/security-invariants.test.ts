import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

async function source(path: string): Promise<string> {
  return readFile(resolve(root, path), "utf8");
}

test("all sensitive admin API routes retain server-side session enforcement", async () => {
  const routes = [
    "app/api/admin/appointments/route.ts",
    "app/api/admin/appointments/revision/route.ts",
    "app/api/admin/availability/route.ts",
    "app/api/admin/booking-settings/route.ts",
    "app/api/admin/calendar/route.ts",
    "app/api/admin/google-calendar/connect/route.ts",
    "app/api/admin/google-calendar/disconnect/route.ts",
    "app/api/admin/google-calendar/status/route.ts",
    "app/api/admin/google-calendar/sync/route.ts",
    "app/api/admin/profile/route.ts",
    "app/api/admin/profile/image/route.ts",
    "app/api/admin/services/route.ts",
    "app/api/admin/auth/password/route.ts",
    "app/api/admin/auth/passkey/register/options/route.ts",
    "app/api/admin/auth/passkey/register/verify/route.ts",
    "app/api/admin/auth/passkey/status/route.ts",
  ];

  const contents = await Promise.all(routes.map(source));
  for (const [index, content] of contents.entries()) {
    assert.match(content, /requireAdminSession/, `Missing admin session enforcement in ${routes[index]}`);
  }
});

test("bearer-token appointment endpoints remain explicitly non-cacheable", async () => {
  const appointmentRoute = await source("app/api/appointments/[confirmationToken]/route.ts");
  const icsRoute = await source("app/api/appointments/[confirmationToken]/ics/route.ts");

  assert.match(appointmentRoute, /private,\s*no-store/);
  assert.match(icsRoute, /private,\s*no-store/);
});

test("production WebAuthn remains fail-closed and uses the pinned origin/RP configuration", async () => {
  const passkeys = await source("lib/admin/passkeys.ts");
  const environment = await source(".env.example");

  assert.match(passkeys, /GRACE_ADMIN_ORIGIN/);
  assert.match(passkeys, /GRACE_ADMIN_RP_ID/);
  assert.match(environment, /GRACE_ADMIN_ORIGIN/);
  assert.match(environment, /GRACE_ADMIN_RP_ID/);
});

test("Google refresh tokens remain encrypted before persistence", async () => {
  const cryptoSource = await source("lib/calendar/google-calendar-crypto.ts");
  const repository = await source("lib/calendar/google-calendar-repository.ts");

  assert.match(cryptoSource, /aes-256-gcm/);
  assert.match(repository, /encryptGoogleRefreshToken/);
});

test("security headers remain configured in Next.js", async () => {
  const config = await source("next.config.ts");
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Content-Security-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(config, new RegExp(header.replaceAll("-", "\\-")), `Missing security header ${header}`);
  }
});

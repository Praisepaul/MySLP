import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const setupCookieName = "grace_google_calendar_setup";
const stateCookieName = "grace_google_calendar_oauth_state";
const setupMaxAgeSeconds = 12 * 60 * 60;
const stateMaxAgeSeconds = 10 * 60;

type SignedValue = {
  issuedAt: number;
  value: string;
};

function getSetupSecret(): string {
  const secret = process.env.GOOGLE_CALENDAR_SETUP_SECRET;
  if (!secret) {
    throw new Error("GOOGLE_CALENDAR_SETUP_SECRET is not configured.");
  }
  return secret;
}

function signValue(payload: string): string {
  return createHmac("sha256", getSetupSecret()).update(payload).digest("base64url");
}

function createSignedValue(value: string, issuedAt = Date.now()): string {
  const payload = `${issuedAt}.${value}`;
  return `${payload}.${signValue(payload)}`;
}

function verifySignedValue(rawValue: string | undefined, maxAgeSeconds: number): string | null {
  if (!rawValue) return null;

  const parts = rawValue.split(".");
  if (parts.length !== 3) return null;

  const [issuedAtRaw, value, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > maxAgeSeconds * 1000) return null;
  if (issuedAt > Date.now() + 60_000) return null;

  const expected = signValue(`${issuedAtRaw}.${value}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  return value;
}

export function isSetupSecretConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CALENDAR_SETUP_SECRET);
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REDIRECT_URI &&
      process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY,
  );
}

export async function unlockGoogleCalendarSetup(secret: string): Promise<boolean> {
  const configuredSecret = process.env.GOOGLE_CALENDAR_SETUP_SECRET;
  if (!configuredSecret || !secret || secret !== configuredSecret) return false;

  const cookieStore = await cookies();
  cookieStore.set(setupCookieName, createSignedValue("unlocked"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: setupMaxAgeSeconds,
  });
  return true;
}

export async function isGoogleCalendarSetupUnlocked(): Promise<boolean> {
  if (!isSetupSecretConfigured()) return false;
  const cookieStore = await cookies();
  return Boolean(verifySignedValue(cookieStore.get(setupCookieName)?.value, setupMaxAgeSeconds));
}

export async function requireGoogleCalendarSetupAccess(): Promise<void> {
  if (!(await isGoogleCalendarSetupUnlocked())) {
    throw new Error("Google Calendar setup access is required.");
  }
}

export async function createGoogleCalendarOAuthState(): Promise<string> {
  const state = randomBytes(32).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(stateCookieName, createSignedValue(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: stateMaxAgeSeconds,
  });
  return state;
}

export async function consumeGoogleCalendarOAuthState(state: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedState = verifySignedValue(cookieStore.get(stateCookieName)?.value, stateMaxAgeSeconds);
  cookieStore.delete(stateCookieName);
  return Boolean(storedState && state && storedState === state);
}

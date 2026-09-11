import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const stateCookieName = "__Host-grace_google_calendar_oauth_state";
const stateMaxAgeSeconds = 10 * 60;

function getOAuthStateSecret(): string {
  const secret = process.env.GOOGLE_CALENDAR_OAUTH_STATE_SECRET;
  if (!secret) throw new Error("GOOGLE_CALENDAR_OAUTH_STATE_SECRET is not configured.");
  return secret;
}

function signValue(payload: string): string {
  return createHmac("sha256", getOAuthStateSecret()).update(payload).digest("base64url");
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

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REDIRECT_URI &&
      process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY,
  );
}

export async function createGoogleCalendarOAuthState(): Promise<string> {
  const state = randomBytes(32).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(stateCookieName, createSignedValue(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
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

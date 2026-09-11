import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getMongoDb } from "@/lib/db/mongodb";

const adminSessionCookieName = "grace_admin_session";
const adminSessionMaxAgeSeconds = 8 * 60 * 60;
const adminLoginRateLimitCollection = "admin_login_rate_limits";
const maxLoginAttempts = 8;
const loginWindowMs = 15 * 60 * 1000;
const loginBlockMs = 15 * 60 * 1000;

export const adminUsername = process.env.GRACE_ADMIN_USERNAME?.trim().toLowerCase() || "gracevpaul";

export class AdminAuthenticationError extends Error {
  constructor() {
    super("Admin authentication is required.");
    this.name = "AdminAuthenticationError";
  }
}

export class AdminAuthenticationConfigurationError extends Error {
  constructor() {
    super("Admin authentication is not configured.");
    this.name = "AdminAuthenticationConfigurationError";
  }
}

function getPasswordHash(): string {
  const passwordHash = process.env.GRACE_ADMIN_PASSWORD_HASH?.trim();
  if (!passwordHash) throw new AdminAuthenticationConfigurationError();
  return passwordHash;
}

function getSessionSecret(): string {
  const secret = process.env.GRACE_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new AdminAuthenticationConfigurationError();
  return secret;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.GRACE_ADMIN_PASSWORD_HASH && process.env.GRACE_ADMIN_SESSION_SECRET && adminUsername);
}

function credentialVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 22);
}

function signSessionPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createSessionValue(username: string): string {
  const issuedAt = Date.now();
  const version = credentialVersion(getPasswordHash());
  const nonce = randomBytes(24).toString("base64url");
  const payload = `${issuedAt}.${username}.${version}.${nonce}`;
  return `${payload}.${signSessionPayload(payload)}`;
}

function verifySessionValue(rawValue: string | undefined): boolean {
  if (!rawValue) return false;

  try {
    const parts = rawValue.split(".");
    if (parts.length !== 5) return false;
    const [issuedAtRaw, username, version, nonce, signature] = parts;
    const issuedAt = Number(issuedAtRaw);
    if (!Number.isFinite(issuedAt) || !username || !version || !nonce || !signature) return false;
    if (Date.now() - issuedAt > adminSessionMaxAgeSeconds * 1000) return false;
    if (issuedAt > Date.now() + 60_000) return false;
    if (username !== adminUsername) return false;
    if (version !== credentialVersion(getPasswordHash())) return false;

    const expected = signSessionPayload(`${issuedAtRaw}.${username}.${version}.${nonce}`);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

function parsePasswordHash(encoded: string): { n: number; r: number; p: number; salt: Buffer; hash: Buffer } | null {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
  if (n < 16 || (n & (n - 1)) !== 0 || r < 1 || p < 1) return null;
  try {
    return {
      n,
      r,
      p,
      salt: Buffer.from(parts[4], "base64url"),
      hash: Buffer.from(parts[5], "base64url"),
    };
  } catch {
    return null;
  }
}

function verifyPassword(password: string): boolean {
  const parsed = parsePasswordHash(getPasswordHash());
  if (!parsed || parsed.salt.length < 8 || parsed.hash.length < 32) return false;
  try {
    const actual = scryptSync(password, parsed.salt, parsed.hash.length, {
      N: parsed.n,
      r: parsed.r,
      p: parsed.p,
      maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(actual, parsed.hash);
  } catch {
    return false;
  }
}

function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function getRateLimitKey(username: string, request: Request): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${username}:${getClientAddress(request)}`)
    .digest("hex");
}

async function ensureRateLimitIndex() {
  try {
    const db = await getMongoDb();
    await db.collection(adminLoginRateLimitCollection).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch {
    // Rate-limit storage is defense-in-depth. Authentication still fails closed on invalid credentials.
  }
}

async function isLoginBlocked(key: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const record = await db.collection<{ blockedUntil?: Date }>(adminLoginRateLimitCollection).findOne({ _id: key });
    return Boolean(record?.blockedUntil && record.blockedUntil.getTime() > Date.now());
  } catch {
    return false;
  }
}

async function recordFailedLogin(key: string): Promise<boolean> {
  try {
    await ensureRateLimitIndex();
    const db = await getMongoDb();
    const collection = db.collection<{
      _id: string;
      attempts: number;
      windowStartedAt: Date;
      blockedUntil?: Date;
      expiresAt: Date;
    }>(adminLoginRateLimitCollection);
    const now = new Date();
    const existing = await collection.findOne({ _id: key });

    if (!existing || existing.windowStartedAt.getTime() <= now.getTime() - loginWindowMs) {
      await collection.updateOne(
        { _id: key },
        { $set: { attempts: 1, windowStartedAt: now, expiresAt: new Date(now.getTime() + loginWindowMs) } },
        { upsert: true },
      );
      return false;
    }

    const attempts = existing.attempts + 1;
    if (attempts >= maxLoginAttempts) {
      const blockedUntil = new Date(now.getTime() + loginBlockMs);
      await collection.updateOne(
        { _id: key },
        { $set: { attempts, blockedUntil, expiresAt: blockedUntil } },
      );
      return true;
    }

    await collection.updateOne(
      { _id: key },
      { $set: { attempts, expiresAt: new Date(existing.windowStartedAt.getTime() + loginWindowMs) } },
    );
    return false;
  } catch {
    return false;
  }
}

async function clearFailedLogins(key: string): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection(adminLoginRateLimitCollection).deleteOne({ _id: key });
  } catch {
    // Do not turn a successful login into an error because rate-limit cleanup failed.
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminAuthConfigured()) return false;
  try {
    const cookieStore = await cookies();
    return verifySessionValue(cookieStore.get(adminSessionCookieName)?.value);
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  if (!isAdminAuthConfigured()) throw new AdminAuthenticationConfigurationError();
  if (!(await isAdminAuthenticated())) throw new AdminAuthenticationError();
}

export async function loginAdmin(username: string, password: string, request: Request): Promise<"success" | "invalid" | "rate_limited"> {
  if (!isAdminAuthConfigured()) throw new AdminAuthenticationConfigurationError();

  const normalizedUsername = username.trim().toLowerCase();
  const key = getRateLimitKey(normalizedUsername || "unknown", request);
  if (await isLoginBlocked(key)) return "rate_limited";

  const valid = normalizedUsername === adminUsername && verifyPassword(password);
  if (!valid) {
    return (await recordFailedLogin(key)) ? "rate_limited" : "invalid";
  }

  await clearFailedLogins(key);
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, createSessionValue(adminUsername), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAgeSeconds,
  });
  return "success";
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}

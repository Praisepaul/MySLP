import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getMongoDb } from "@/lib/db/mongodb";

const adminSessionCookieName = "grace_admin_session";
const adminSessionMaxAgeSeconds = 8 * 60 * 60;
const adminLoginRateLimitCollection = "admin_login_rate_limits";
const adminCredentialsCollection = "admin_credentials";
const adminCredentialsId = "admin";
const maxLoginAttempts = 8;
const loginWindowMs = 15 * 60 * 1000;
const loginBlockMs = 15 * 60 * 1000;

type AdminLoginRateLimitRecord = {
  _id: string;
  attempts: number;
  windowStartedAt: Date;
  blockedUntil?: Date;
  expiresAt: Date;
};

type AdminCredentialsRecord = {
  _id: string;
  username: string;
  passwordHash: string;
  updatedAt: Date;
};

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

function getEnvironmentPasswordHash(): string {
  const passwordHash = process.env.GRACE_ADMIN_PASSWORD_HASH?.trim();
  if (!passwordHash) throw new AdminAuthenticationConfigurationError();
  return passwordHash;
}

async function getStoredCredentials(): Promise<AdminCredentialsRecord | null> {
  try {
    const db = await getMongoDb();
    return await db.collection<AdminCredentialsRecord>(adminCredentialsCollection).findOne({ _id: adminCredentialsId });
  } catch {
    return null;
  }
}

async function getActivePasswordHash(): Promise<string> {
  const stored = await getStoredCredentials();
  if (stored?.passwordHash) return stored.passwordHash;
  return getEnvironmentPasswordHash();
}

function getSessionSecret(): string {
  const secret = process.env.GRACE_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new AdminAuthenticationConfigurationError();
  return secret;
}

function credentialVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 22);
}

function signSessionPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

async function createSessionValue(username: string): Promise<string> {
  const issuedAt = Date.now();
  const version = credentialVersion(await getActivePasswordHash());
  const nonce = randomBytes(24).toString("base64url");
  const payload = `${issuedAt}.${username}.${version}.${nonce}`;
  return `${payload}.${signSessionPayload(payload)}`;
}

export async function establishAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, await createSessionValue(adminUsername), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAgeSeconds,
  });
}

async function verifySessionValue(rawValue: string | undefined): Promise<boolean> {
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

    const activePasswordHash = await getActivePasswordHash();
    if (version !== credentialVersion(activePasswordHash)) return false;

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

function verifyPasswordAgainstHash(password: string, encodedHash: string): boolean {
  const parsed = parsePasswordHash(encodedHash);
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

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return verifyPasswordAgainstHash(password, await getActivePasswordHash());
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const activePasswordHash = await getActivePasswordHash();
  if (!verifyPasswordAgainstHash(currentPassword, activePasswordHash)) return false;

  const passwordHash = hashAdminPassword(newPassword);
  const db = await getMongoDb();
  await db.collection<AdminCredentialsRecord>(adminCredentialsCollection).updateOne(
    { _id: adminCredentialsId },
    { $set: { username: adminUsername, passwordHash, updatedAt: new Date() } },
    { upsert: true },
  );

  await establishAdminSession();
  return true;
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
    await db.collection<AdminLoginRateLimitRecord>(adminLoginRateLimitCollection).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch {
    // Rate-limit storage is defense-in-depth. Authentication still fails closed on invalid credentials.
  }
}

async function isLoginBlocked(key: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const record = await db.collection<AdminLoginRateLimitRecord>(adminLoginRateLimitCollection).findOne({ _id: key });
    return Boolean(record?.blockedUntil && record.blockedUntil.getTime() > Date.now());
  } catch {
    return false;
  }
}

async function recordFailedLogin(key: string): Promise<boolean> {
  try {
    await ensureRateLimitIndex();
    const db = await getMongoDb();
    const collection = db.collection<AdminLoginRateLimitRecord>(adminLoginRateLimitCollection);
    const now = new Date();
    const existing = await collection.findOne({ _id: key });

    if (!existing || existing.windowStartedAt.getTime() <= now.getTime() - loginWindowMs) {
      await collection.updateOne({ _id: key }, { $set: { attempts: 1, windowStartedAt: now, expiresAt: new Date(now.getTime() + loginWindowMs) } }, { upsert: true });
      return false;
    }

    const attempts = existing.attempts + 1;
    if (attempts >= maxLoginAttempts) {
      const blockedUntil = new Date(now.getTime() + loginBlockMs);
      await collection.updateOne({ _id: key }, { $set: { attempts, blockedUntil, expiresAt: blockedUntil } });
      return true;
    }

    await collection.updateOne({ _id: key }, { $set: { attempts, expiresAt: new Date(existing.windowStartedAt.getTime() + loginWindowMs) } });
    return false;
  } catch {
    return false;
  }
}

async function clearFailedLogins(key: string): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection<AdminLoginRateLimitRecord>(adminLoginRateLimitCollection).deleteOne({ _id: key });
  } catch {
    // Do not turn a successful login into an error because rate-limit cleanup failed.
  }
}

export async function isAdminAuthConfigured(): Promise<boolean> {
  if (!process.env.GRACE_ADMIN_SESSION_SECRET || process.env.GRACE_ADMIN_SESSION_SECRET.length < 32 || !adminUsername) return false;
  if (process.env.GRACE_ADMIN_PASSWORD_HASH?.trim()) return true;
  const stored = await getStoredCredentials();
  return Boolean(stored?.passwordHash);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!(await isAdminAuthConfigured())) return false;
  try {
    const cookieStore = await cookies();
    return verifySessionValue(cookieStore.get(adminSessionCookieName)?.value);
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthConfigured())) throw new AdminAuthenticationConfigurationError();
  if (!(await isAdminAuthenticated())) throw new AdminAuthenticationError();
}

export async function loginAdmin(username: string, password: string, request: Request): Promise<"success" | "invalid" | "rate_limited"> {
  if (!(await isAdminAuthConfigured())) throw new AdminAuthenticationConfigurationError();

  const normalizedUsername = username.trim().toLowerCase();
  const key = getRateLimitKey(normalizedUsername || "unknown", request);
  if (await isLoginBlocked(key)) return "rate_limited";

  const valid = normalizedUsername === adminUsername && await verifyAdminPassword(password);
  if (!valid) return (await recordFailedLogin(key)) ? "rate_limited" : "invalid";

  await clearFailedLogins(key);
  await establishAdminSession();
  return "success";
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}

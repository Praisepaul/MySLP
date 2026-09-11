import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { getMongoDb } from "@/lib/db/mongodb";
import { adminUsername, requireAdminSession } from "@/lib/admin/auth";

const passkeyCollection = "admin_passkeys";
const challengeCollection = "admin_passkey_challenges";
const challengeCookieName = "__Host-grace_admin_passkey_challenge";
const challengeMaxAgeSeconds = 5 * 60;
const passkeyUserId = "admin";
const passkeyUserName = "grace-admin";

type AdminPasskeyRecord = {
  _id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: Date;
  lastUsedAt?: Date;
};

type ChallengePayload = {
  challenge: string;
  action: "registration" | "authentication";
  issuedAt: number;
  nonce: string;
};

type PasskeyChallengeRecord = {
  _id: string;
  challenge: string;
  action: ChallengePayload["action"];
  expiresAt: Date;
};

function getConfiguredRp(): { rpID: string; origin: string } {
  const configuredOrigin = process.env.GRACE_ADMIN_ORIGIN?.trim().replace(/\/$/, "");
  const configuredRpId = process.env.GRACE_ADMIN_RP_ID?.trim();

  if (process.env.NODE_ENV === "production" && (!configuredOrigin || !configuredRpId)) {
    throw new Error("GRACE_ADMIN_ORIGIN and GRACE_ADMIN_RP_ID are required in production.");
  }

  if (configuredOrigin && configuredRpId) return { rpID: configuredRpId, origin: configuredOrigin };
  return { rpID: "localhost", origin: "http://localhost:3000" };
}

function getChallengeSecret(): string {
  const secret = process.env.GRACE_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin authentication is not configured.");
  return secret;
}

function signChallenge(payload: string): string {
  return createHmac("sha256", getChallengeSecret()).update(payload).digest("base64url");
}

function signaturesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function createChallengeCookieValue(challenge: string, action: ChallengePayload["action"], nonce: string): string {
  const payload = JSON.stringify({ challenge, action, issuedAt: Date.now(), nonce } satisfies ChallengePayload);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${signChallenge(encoded)}`;
}

function parseChallengeCookie(rawValue: string | undefined, expectedAction: ChallengePayload["action"]): ChallengePayload | null {
  if (!rawValue) return null;
  try {
    const [encoded, signature] = rawValue.split(".");
    if (!encoded || !signature || !signaturesMatch(signature, signChallenge(encoded))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ChallengePayload;
    if (payload.action !== expectedAction || !payload.challenge || !payload.issuedAt || !payload.nonce) return null;
    if (Date.now() - payload.issuedAt > challengeMaxAgeSeconds * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function setChallengeCookie(challenge: string, action: ChallengePayload["action"]): Promise<void> {
  const nonce = randomBytes(24).toString("base64url");
  const db = await getMongoDb();
  await ensurePasskeyIndexes();
  await db.collection<PasskeyChallengeRecord>(challengeCollection).insertOne({
    _id: nonce,
    challenge,
    action,
    expiresAt: new Date(Date.now() + challengeMaxAgeSeconds * 1000),
  });

  const cookieStore = await cookies();
  cookieStore.set(challengeCookieName, createChallengeCookieValue(challenge, action, nonce), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: challengeMaxAgeSeconds,
  });
}

async function consumeChallengeCookie(expectedAction: ChallengePayload["action"]): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = parseChallengeCookie(cookieStore.get(challengeCookieName)?.value, expectedAction);
  cookieStore.delete(challengeCookieName);
  if (!payload) return null;

  const db = await getMongoDb();
  const result = await db.collection<PasskeyChallengeRecord>(challengeCollection).findOneAndDelete({
    _id: payload.nonce,
    challenge: payload.challenge,
    action: expectedAction,
    expiresAt: { $gt: new Date() },
  });
  return result ? payload.challenge : null;
}

async function ensurePasskeyIndexes(): Promise<void> {
  const db = await getMongoDb();
  await Promise.all([
    db.collection<AdminPasskeyRecord>(passkeyCollection).createIndex({ credentialId: 1 }, { unique: true, name: "credentialId_unique" }),
    db.collection<AdminPasskeyRecord>(passkeyCollection).createIndex({ userId: 1 }, { name: "userId_lookup" }),
    db.collection<PasskeyChallengeRecord>(challengeCollection).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expiresAt_ttl" }),
  ]);
}

async function listPasskeys(): Promise<AdminPasskeyRecord[]> {
  const db = await getMongoDb();
  return db.collection<AdminPasskeyRecord>(passkeyCollection).find({ userId: passkeyUserId }).toArray();
}

async function getPasskeyByCredentialId(credentialId: string): Promise<AdminPasskeyRecord | null> {
  const db = await getMongoDb();
  return db.collection<AdminPasskeyRecord>(passkeyCollection).findOne({ credentialId, userId: passkeyUserId });
}

export async function beginAdminPasskeyRegistration() {
  await requireAdminSession();
  await ensurePasskeyIndexes();
  const existing = await listPasskeys();
  const { rpID } = getConfiguredRp();
  const options = await generateRegistrationOptions({
    rpName: "Grace Session Scheduler",
    rpID,
    userID: Buffer.from(passkeyUserId),
    userName: passkeyUserName,
    userDisplayName: "Grace therapist account",
    timeout: 60_000,
    attestationType: "none",
    excludeCredentials: existing.map((credential) => ({ id: credential.credentialId, transports: credential.transports as never })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
  });
  await setChallengeCookie(options.challenge, "registration");
  return options;
}

export async function finishAdminPasskeyRegistration(response: RegistrationResponseJSON) {
  await requireAdminSession();
  const expectedChallenge = await consumeChallengeCookie("registration");
  if (!expectedChallenge) throw new Error("The passkey registration request has expired. Please try again.");

  const { origin, rpID } = getConfiguredRp();
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) throw new Error("Passkey registration could not be verified.");

  const { credential } = verification.registrationInfo;
  const db = await getMongoDb();
  await db.collection<AdminPasskeyRecord>(passkeyCollection).insertOne({
    _id: credential.id,
    userId: passkeyUserId,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports,
    createdAt: new Date(),
  });
}

export async function beginAdminPasskeyAuthentication() {
  const { rpID } = getConfiguredRp();
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    timeout: 60_000,
  });
  await setChallengeCookie(options.challenge, "authentication");
  return options;
}

export async function finishAdminPasskeyAuthentication(response: AuthenticationResponseJSON): Promise<boolean> {
  const expectedChallenge = await consumeChallengeCookie("authentication");
  if (!expectedChallenge) throw new Error("The passkey sign-in request has expired. Please try again.");

  const stored = await getPasskeyByCredentialId(response.id);
  if (!stored) return false;

  const { origin, rpID } = getConfiguredRp();
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: stored.credentialId,
      publicKey: Buffer.from(stored.publicKey, "base64url"),
      counter: stored.counter,
      transports: stored.transports as never,
    },
    requireUserVerification: true,
  });
  if (!verification.verified) return false;

  const db = await getMongoDb();
  const result = await db.collection<AdminPasskeyRecord>(passkeyCollection).updateOne(
    { _id: stored._id, counter: stored.counter },
    { $set: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() } },
  );
  return result.modifiedCount === 1;
}

export async function getAdminPasskeyStatus(): Promise<{ enabled: boolean; count: number }> {
  await requireAdminSession();
  try {
    const count = await (await getMongoDb()).collection<AdminPasskeyRecord>(passkeyCollection).countDocuments({ userId: passkeyUserId });
    return { enabled: count > 0, count };
  } catch {
    return { enabled: false, count: 0 };
  }
}

export function getPasskeyUserLabel(): string {
  return adminUsername;
}

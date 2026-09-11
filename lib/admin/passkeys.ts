import { cookies } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { getMongoDb } from "@/lib/db/mongodb";
import { adminUsername, isAdminAuthenticated, requireAdminSession } from "@/lib/admin/auth";

const passkeyCollection = "admin_passkeys";
const challengeCookieName = "grace_admin_passkey_challenge";
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

function getRpId(request: Request): string {
  return new URL(request.url).hostname;
}

function getOrigin(request: Request): string {
  return new URL(request.url).origin;
}

function getChallengeSecret(): string {
  const secret = process.env.GRACE_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin authentication is not configured.");
  return secret;
}

function signChallenge(payload: string): string {
  return createHmac("sha256", getChallengeSecret()).update(payload).digest("base64url");
}

function createChallengeCookieValue(challenge: string, action: ChallengePayload["action"]): string {
  const payload = JSON.stringify({ challenge, action, issuedAt: Date.now(), nonce: randomBytes(18).toString("base64url") } satisfies ChallengePayload);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${signChallenge(encoded)}`;
}

function consumeChallengeCookie(rawValue: string | undefined, expectedAction: ChallengePayload["action"]): string | null {
  if (!rawValue) return null;
  try {
    const [encoded, signature] = rawValue.split(".");
    if (!encoded || !signature || signChallenge(encoded) !== signature) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ChallengePayload;
    if (payload.action !== expectedAction || !payload.challenge || !payload.issuedAt) return null;
    if (Date.now() - payload.issuedAt > challengeMaxAgeSeconds * 1000) return null;
    return payload.challenge;
  } catch {
    return null;
  }
}

async function setChallengeCookie(challenge: string, action: ChallengePayload["action"]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(challengeCookieName, createChallengeCookieValue(challenge, action), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: challengeMaxAgeSeconds,
  });
}

async function clearChallengeCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(challengeCookieName);
}

async function listPasskeys(): Promise<AdminPasskeyRecord[]> {
  const db = await getMongoDb();
  return db.collection<AdminPasskeyRecord>(passkeyCollection).find({ userId: passkeyUserId }).toArray();
}

async function getPasskeyByCredentialId(credentialId: string): Promise<AdminPasskeyRecord | null> {
  const db = await getMongoDb();
  return db.collection<AdminPasskeyRecord>(passkeyCollection).findOne({ credentialId, userId: passkeyUserId });
}

export async function hasAdminPasskeys(): Promise<boolean> {
  try {
    return (await getMongoDb()).collection<AdminPasskeyRecord>(passkeyCollection).countDocuments({ userId: passkeyUserId }) > 0;
  } catch {
    return false;
  }
}

export async function beginAdminPasskeyRegistration(request: Request) {
  await requireAdminSession();
  const existing = await listPasskeys();
  const options = await generateRegistrationOptions({
    rpName: "Grace Session Scheduler",
    rpID: getRpId(request),
    userID: passkeyUserId,
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

export async function finishAdminPasskeyRegistration(request: Request, response: RegistrationResponseJSON) {
  await requireAdminSession();
  const expectedChallenge = consumeChallengeCookie((await cookies()).get(challengeCookieName)?.value, "registration");
  if (!expectedChallenge) throw new Error("The passkey registration request has expired. Please try again.");

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(request),
    expectedRPID: getRpId(request),
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
  await clearChallengeCookie();
}

export async function beginAdminPasskeyAuthentication(request: Request) {
  const options = await generateAuthenticationOptions({
    rpID: getRpId(request),
    userVerification: "required",
    timeout: 60_000,
  });
  await setChallengeCookie(options.challenge, "authentication");
  return options;
}

export async function finishAdminPasskeyAuthentication(request: Request, response: AuthenticationResponseJSON): Promise<boolean> {
  const expectedChallenge = consumeChallengeCookie((await cookies()).get(challengeCookieName)?.value, "authentication");
  if (!expectedChallenge) throw new Error("The passkey sign-in request has expired. Please try again.");

  const stored = await getPasskeyByCredentialId(response.id);
  if (!stored) return false;

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(request),
    expectedRPID: getRpId(request),
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
  await db.collection<AdminPasskeyRecord>(passkeyCollection).updateOne(
    { _id: stored._id },
    { $set: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() } },
  );
  await clearChallengeCookie();
  return true;
}

export async function getAdminPasskeyStatus(): Promise<{ enabled: boolean; count: number }> {
  if (!(await isAdminAuthenticated())) return { enabled: false, count: 0 };
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

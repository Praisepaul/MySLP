import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function getEncryptionKey(): Buffer {
  const secret = process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY is not configured.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptGoogleRefreshToken(refreshToken: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(refreshToken, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptGoogleRefreshToken(payload: string): string {
  const [ivRaw, authTagRaw, ciphertextRaw] = payload.split(".");
  if (!ivRaw || !authTagRaw || !ciphertextRaw) {
    throw new Error("Stored Google Calendar token is malformed.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivRaw, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

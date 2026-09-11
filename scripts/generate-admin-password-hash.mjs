import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { randomBytes, scryptSync } from "node:crypto";

const rl = createInterface({ input, output });
const password = await rl.question("Admin password: ");
rl.close();

if (!password) {
  console.error("Password cannot be empty.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
});

console.log(`GRACE_ADMIN_PASSWORD_HASH=scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}`);

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { randomBytes, scryptSync } from "node:crypto";

const rl = createInterface({ input, output });
const password = await rl.question("Admin password: ");
rl.close();

if (password.length < 15 || password.length > 128) {
  console.error("Password must be between 15 and 128 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, {
  N: 32_768,
  r: 8,
  p: 2,
  maxmem: 64 * 1024 * 1024,
});

console.log(`GRACE_ADMIN_PASSWORD_HASH=scrypt$32768$8$2$${salt.toString("base64url")}$${hash.toString("base64url")}`);

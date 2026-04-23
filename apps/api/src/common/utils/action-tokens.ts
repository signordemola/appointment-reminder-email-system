import { createHash, randomBytes } from "node:crypto";

export function createRawActionToken() {
  return randomBytes(32).toString("hex");
}

export function hashActionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

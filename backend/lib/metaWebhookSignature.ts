import crypto from "node:crypto";

/**
 * Valide l’en-tête `X-Hub-Signature-256` (préfixe `sha256=`) pour un corps brut JSON.
 * @see https://developers.facebook.com/docs/instagram-platform/webhooks
 */
export function verifyMetaXHubSignature256(
  rawBody: Buffer,
  header: string | undefined,
  appSecret: string,
): boolean {
  if (!header || !header.startsWith("sha256=")) return false;
  const receivedHex = header.slice(7);
  const expectedHex = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  try {
    const a = Buffer.from(receivedHex, "hex");
    const b = Buffer.from(expectedHex, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

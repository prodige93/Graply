import crypto from "node:crypto";

/**
 * Meta envoie un champ `signed_request` (form-urlencoded) aux callbacks
 * Deauthorize / Data Deletion. Format : `SIGNATURE.PAYLOAD` (base64url).
 *
 * Référence :
 *  - https://developers.facebook.com/docs/facebook-login/guides/advanced/existing-system/#parsingsr
 *  - https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

export interface MetaSignedRequestPayload {
  algorithm: string;
  issued_at?: number;
  user_id?: string;
  [key: string]: unknown;
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLen), "base64");
}

/**
 * Retourne le payload JSON décodé si la signature HMAC-SHA256 est valide, sinon `null`.
 */
export function parseMetaSignedRequest(
  signedRequest: string | undefined | null,
  appSecret: string,
): MetaSignedRequestPayload | null {
  if (!signedRequest || typeof signedRequest !== "string") return null;
  const dotIdx = signedRequest.indexOf(".");
  if (dotIdx < 1 || dotIdx === signedRequest.length - 1) return null;

  const encodedSig = signedRequest.slice(0, dotIdx);
  const encodedPayload = signedRequest.slice(dotIdx + 1);

  let expected: Buffer;
  let received: Buffer;
  try {
    received = base64UrlDecodeToBuffer(encodedSig);
    expected = crypto
      .createHmac("sha256", appSecret)
      .update(encodedPayload)
      .digest();
  } catch {
    return null;
  }

  if (received.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(received, expected)) return null;

  try {
    const payloadJson = base64UrlDecodeToBuffer(encodedPayload).toString("utf8");
    const payload = JSON.parse(payloadJson) as MetaSignedRequestPayload;
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.algorithm !== "string") return null;
    if (!/^HMAC-SHA256$/i.test(payload.algorithm)) return null;
    return payload;
  } catch {
    return null;
  }
}

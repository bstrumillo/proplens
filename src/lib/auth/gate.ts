// Optional pre-launch password curtain in front of the whole app.
// Enabled only when GATE_PASSWORD is set. The cookie stores an HMAC of the
// password (keyed by BETTER_AUTH_SECRET) so a forged "authenticated" literal
// no longer works. Uses Web Crypto so it runs in both the edge middleware
// and Node route handlers.

export const GATE_COOKIE = "proplens-gate";

export function gateEnabled(): boolean {
  return Boolean(process.env.GATE_PASSWORD);
}

export async function gateCookieValue(): Promise<string> {
  const password = process.env.GATE_PASSWORD ?? "";
  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isGatePassed(
  cookieValue: string | undefined
): Promise<boolean> {
  if (!gateEnabled()) return true;
  if (!cookieValue) return false;
  return cookieValue === (await gateCookieValue());
}

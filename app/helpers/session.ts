const AUTH_COOKIE_NAME = "cypher_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function getServerCookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

// Server-side function for App Router
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await getServerCookieStore();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getServerAuthCookieHeader(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await getServerCookieStore();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    // "none" is required for cross-origin requests (frontend ↔ backend on different Vercel domains).
    // "lax" blocks cookies on all cross-origin API calls — works in dev (localhost = same-site)
    // but silently fails in production. "none" requires Secure: true, which IS_PRODUCTION guarantees.
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function deleteAuthCookie() {
  const cookieStore = await getServerCookieStore();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

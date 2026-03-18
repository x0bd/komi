import { createNeonAuth } from "@neondatabase/auth/next/server"

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ?? process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.BETTER_AUTH_SECRET ??
  (process.env.NODE_ENV === "development"
    ? "komi-local-dev-cookie-secret-minimum-32-chars"
    : undefined)

if (!baseUrl) {
  throw new Error(
    "Missing required config: NEON_AUTH_BASE_URL (or NEXT_PUBLIC_NEON_AUTH_BASE_URL). Add it to .env.local and restart dev server."
  )
}

if (!cookieSecret) {
  throw new Error(
    "Missing required config: NEON_AUTH_COOKIE_SECRET (or AUTH_SECRET/BETTER_AUTH_SECRET). Add it to .env.local and restart dev server."
  )
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
})

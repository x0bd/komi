import { createNeonAuth } from "@neondatabase/auth/next/server"

export const auth = createNeonAuth({
  baseURL: process.env.NEON_AUTH_BASE_URL,
  secret: process.env.NEON_AUTH_COOKIE_SECRET,
})


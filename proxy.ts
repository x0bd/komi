import { auth } from "@/lib/auth/server"

export default auth.middleware({
  loginUrl: "/auth/sign-in",
})

export const config = {
  matcher: ["/", "/account/:path*", "/games/:path*", "/profile/:path*", "/replay/:path*"],
}

"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui"
import { LiveblocksProvider } from "@liveblocks/react"
import { ThemeProvider } from "next-themes"
import { authClient } from "@/lib/auth/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <NeonAuthUIProvider authClient={authClient} redirectTo="/">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NeonAuthUIProvider>
    </LiveblocksProvider>
  )
}

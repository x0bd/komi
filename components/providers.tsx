"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui"
import { LiveblocksProvider } from "@liveblocks/react"
import { authClient } from "@/lib/auth/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <NeonAuthUIProvider authClient={authClient} redirectTo="/">
        {children}
      </NeonAuthUIProvider>
    </LiveblocksProvider>
  )
}

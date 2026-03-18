"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui"
import { ThemeProvider } from "next-themes"
import { authClient } from "@/lib/auth/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </NeonAuthUIProvider>
  )
}

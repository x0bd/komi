"use client"

import { cn } from "@/lib/utils"

export function GameLayout({
  board,
  sidebar,
  className,
}: {
  board: React.ReactNode
  sidebar: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-svh items-center justify-center overflow-hidden bg-background",
        className
      )}
    >
      <WashiTexture />

      <div className="relative z-10 flex w-full max-w-[1440px] items-start gap-8 px-6 py-8 max-lg:flex-col max-lg:items-center max-lg:gap-6 lg:px-10">
        {/* Board area */}
        <main className="flex flex-1 items-center justify-center max-lg:w-full">
          {board}
        </main>

        {/* Sidebar */}
        <aside className="flex w-full flex-col gap-4 lg:w-[380px] lg:min-w-[340px] lg:max-h-[calc(100svh-4rem)] lg:overflow-y-auto lg:pr-1">
          {sidebar}
        </aside>
      </div>
    </div>
  )
}

function WashiTexture() {
  return (
    <>
      {/* Subtle noise grain — gives the washi paper feel */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-multiply dark:mix-blend-soft-light dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Ambient glow — warm in light, cool in dark */}
      <div className="pointer-events-none fixed -top-[20%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px] dark:bg-accent/[0.03]" />
      <div className="pointer-events-none fixed -bottom-[15%] -left-[10%] z-0 h-[500px] w-[500px] rounded-full bg-status-active/5 blur-[100px] dark:bg-status-active/[0.02]" />
    </>
  )
}

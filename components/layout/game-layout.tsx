"use client"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
        "relative flex min-h-svh flex-col overflow-hidden bg-background",
        className
      )}
    >
      <WashiTexture />

      {/* Floating topbar — logo left, theme toggle right */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-4 lg:px-10">
        <span className="pointer-events-auto font-display text-sm font-bold tracking-[0.12em] text-foreground/40 select-none uppercase">
          Komi
        </span>
        <ThemeToggle className="pointer-events-auto" />
      </header>

      {/* Vertically + horizontally centered main area */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16 lg:px-10">
        <div className="flex w-full max-w-[1440px] items-center gap-8 max-lg:flex-col max-lg:gap-6">
          {/* Board — takes remaining space, centered */}
          <main className="flex flex-1 items-center justify-center max-lg:w-full">
            {board}
          </main>

          {/* Sidebar — fixed width, vertically scrollable if needed */}
          <aside className="flex w-full flex-col gap-4 lg:w-[380px] lg:min-w-[340px] lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto lg:pr-1">
            {sidebar}
          </aside>
        </div>
      </div>
    </div>
  )
}

function WashiTexture() {
  return (
    <>
      {/* Subtle noise grain */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-multiply dark:mix-blend-soft-light dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      {/* Ambient warm glow */}
      <div className="pointer-events-none fixed -top-[20%] -right-[10%] z-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px] dark:bg-accent/3" />
      <div className="pointer-events-none fixed -bottom-[15%] -left-[10%] z-0 h-[500px] w-[500px] rounded-full bg-status-active/5 blur-[100px] dark:bg-status-active/2" />
    </>
  )
}

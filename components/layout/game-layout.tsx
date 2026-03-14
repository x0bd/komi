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

      {/* Main area */}
      <div className="relative z-10 flex flex-1 justify-center px-6 py-16 lg:px-10 lg:py-8">
        <div className="flex w-full max-w-[1416px] items-start gap-8 max-lg:flex-col max-lg:gap-6">
          {/* Board — takes remaining space, centered */}
          <main className="flex flex-1 items-center justify-center pt-4 max-lg:w-full lg:min-h-[calc(100svh-4rem)] lg:pt-8">
            {board}
          </main>

          {/* Sidebar — fixed rail */}
          <aside className="relative z-20 w-full px-3 pb-24 lg:mt-7 lg:w-[396px] lg:min-w-[374px] lg:self-start lg:px-0 lg:pb-0">
            <div className="flex flex-col rounded-[2rem] border border-border/70 bg-card/[0.46] p-4 shadow-[0_28px_80px_-38px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.05] backdrop-blur-xl lg:p-5">
              {sidebar}
            </div>
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

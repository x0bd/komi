"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full",
        "border border-border bg-background/80 backdrop-blur-md",
        "shadow-[0_2px_8px_oklch(0_0_0/10%)] transition-all duration-200",
        "hover:scale-105 hover:shadow-[0_4px_16px_oklch(0_0_0/14%)]",
        "active:scale-95",
        className
      )}
    >
      {/* Animated icon swap */}
      <span
        className={cn(
          "absolute transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          mounted && isDark
            ? "translate-y-0 rotate-0 opacity-100"
            : "-translate-y-3 rotate-90 opacity-0"
        )}
      >
        <HugeiconsIcon
          icon={Moon01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.75}
          className="text-foreground"
        />
      </span>

      <span
        className={cn(
          "absolute transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          mounted && !isDark
            ? "translate-y-0 rotate-0 opacity-100"
            : "translate-y-3 -rotate-90 opacity-0"
        )}
      >
        <HugeiconsIcon
          icon={Sun01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.75}
          className="text-foreground"
        />
      </span>
    </button>
  )
}

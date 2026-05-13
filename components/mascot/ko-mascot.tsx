"use client"

import { cn } from "@/lib/utils"
import {
  SpriteAnimator,
  type SpriteAnimationMap,
} from "@/components/mascot/sprite-animator"

export type KoMood =
  | "idle"
  | "blink"
  | "thinking"
  | "praise"
  | "warning"
  | "teaching"
  | "confused"
  | "focused"
  | "happy"
  | "review"
  | "sleep"
  | "bow"

export const KO_SPRITE_SHEET = {
  src: "/mascots/ko-sprite-sheet.png",
  columns: 4,
  rows: 3,
  frameCount: 12,
} as const

export const KO_ANIMATIONS: SpriteAnimationMap = {
  idle: { frames: [0, 0, 1, 0], fps: 2.5 },
  blink: { frames: [0, 1, 0], fps: 7, loop: false },
  thinking: { frames: [2, 2, 7, 2], fps: 4 },
  praise: { frames: [3, 8, 3, 0], fps: 6, loop: false },
  warning: { frames: [4, 4, 0], fps: 5, loop: false },
  teaching: { frames: [5, 5, 2, 5], fps: 4 },
  confused: { frames: [6, 2, 6, 0], fps: 4, loop: false },
  focused: { frames: [7], fps: 1 },
  happy: { frames: [8, 3, 8, 0], fps: 5, loop: false },
  review: { frames: [9, 7, 9], fps: 4 },
  sleep: { frames: [10], fps: 1 },
  bow: { frames: [11, 11, 0], fps: 4, loop: false },
}

export type KoMascotProps = {
  mood?: KoMood
  size?: "sm" | "md" | "lg" | "hero"
  play?: boolean
  className?: string
}

const KO_SIZE_CLASS: Record<NonNullable<KoMascotProps["size"]>, string> = {
  sm: "size-16",
  md: "size-24",
  lg: "size-36",
  hero: "size-44 md:size-56",
}

export function KoMascot({
  mood = "idle",
  size = "md",
  play = true,
  className,
}: KoMascotProps) {
  return (
    <SpriteAnimator
      {...KO_SPRITE_SHEET}
      animation={mood}
      animations={KO_ANIMATIONS}
      play={play}
      label={`Ko mascot, ${mood}`}
      className={cn(KO_SIZE_CLASS[size], "select-none", className)}
      spriteClassName="[image-rendering:auto]"
    />
  )
}

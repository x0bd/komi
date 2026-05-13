"use client"

import { KoMascot, type KoMood } from "@/components/mascot/ko-mascot"
import { MokuMascot } from "@/components/mascot/moku-mascot"
import {
  MASCOT_OPTIONS,
  type MascotId,
  type MascotMood,
} from "@/lib/mascot"

export { MASCOT_OPTIONS }
export type { MascotId, MascotMood }

export type MascotAvatarProps = {
  mascot?: MascotId
  mood?: MascotMood
  size?: "sm" | "md" | "lg" | "hero"
  play?: boolean
  animationKey?: string | number
  className?: string
}

export function MascotAvatar({
  mascot = "ko",
  mood = "idle",
  size = "md",
  play = true,
  animationKey,
  className,
}: MascotAvatarProps) {
  if (mascot === "moku") {
    return (
      <MokuMascot
        mood={mood}
        size={size}
        play={play}
        animationKey={animationKey}
        className={className}
      />
    )
  }

  return (
    <KoMascot
      mood={mood as KoMood}
      size={size}
      play={play}
      animationKey={animationKey}
      className={className}
    />
  )
}

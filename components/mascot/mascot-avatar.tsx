"use client"

import { KoMascot, type KoMood } from "@/components/mascot/ko-mascot"
import { MokuMascot } from "@/components/mascot/moku-mascot"

export type MascotId = "ko" | "moku"
export type MascotMood = KoMood

export const MASCOT_OPTIONS: Array<{
  id: MascotId
  name: string
  role: string
  description: string
}> = [
  {
    id: "ko",
    name: "Kō",
    role: "Classic sensei",
    description: "Calm tactical coach with steady board-reading energy.",
  },
  {
    id: "moku",
    name: "Moku",
    role: "Board fox",
    description: "Quiet fox guide that spots weak points and clean shape.",
  },
]

export type MascotAvatarProps = {
  mascot?: MascotId
  mood?: MascotMood
  size?: "sm" | "md" | "lg" | "hero"
  play?: boolean
  className?: string
}

export function MascotAvatar({
  mascot = "ko",
  mood = "idle",
  size = "md",
  play = true,
  className,
}: MascotAvatarProps) {
  if (mascot === "moku") {
    return <MokuMascot mood={mood} size={size} play={play} className={className} />
  }

  return <KoMascot mood={mood} size={size} play={play} className={className} />
}

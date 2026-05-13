export type MascotId = "ko" | "moku"

export type MascotMood =
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

export type MascotSignalSource = "logic" | "analysis" | "llm" | "system"

export type MascotSignal = {
  mood: MascotMood
  message: string
  source: MascotSignalSource
  intensity: 0 | 1 | 2 | 3
  eventLabel: string
}

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

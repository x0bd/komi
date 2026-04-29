type Presence = {
  cursor: { x: number; y: number } | null
  hoveredIntersection: { x: number; y: number } | null
  connectionQuality: "good" | "poor" | "offline"
  stoneColor: "black" | "white" | null
}

type Storage = {
  size: 9 | 13 | 19
  komi: number
  board: number[]
  turn: "black" | "white"
  captured: {
    black: number
    white: number
  }
  moveNumber: number
  consecutivePasses: number
  ko: number | null
  history: string[]
  moveHistory: Array<{
    x: number
    y: number
    player: "black" | "white"
    isPass: boolean
  }>
  timers: {
    black: number
    white: number
  }
  isGameOver: boolean
  winner: "black" | "white" | "draw" | null
  gameOverReason: "score" | "resignation" | "timeout" | null
}

type UserInfo = {
  name?: string
  avatar?: string
  email?: string
}

declare global {
  interface Liveblocks {
    Presence: Presence
    Storage: Storage
    UserMeta: {
      id: string
      info: UserInfo
    }
    RoomEvent:
      | { type: "stone"; x: number; y: number; player: "black" | "white" }
      | { type: "pass"; player: "black" | "white" }
    ThreadMetadata: {
      [key: string]: string | number | boolean | null
    }
  }
}

export {}

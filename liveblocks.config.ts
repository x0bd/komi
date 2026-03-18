type Presence = {
  cursor: { x: number; y: number } | null
  hoveredIntersection: { x: number; y: number } | null
  connectionQuality: "good" | "poor" | "offline"
}

type Storage = {
  board: number[]
  turn: "black" | "white"
  captured: {
    black: number
    white: number
  }
  moveNumber: number
  timers: {
    black: number
    white: number
  }
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

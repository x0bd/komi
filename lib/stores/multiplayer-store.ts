import { create } from "zustand"

type ConnectionState = "idle" | "creating-room" | "joining-room" | "ready" | "error"

type MultiplayerStore = {
  roomId: string | null
  shareUrl: string | null
  state: ConnectionState
  error: string | null
  createRoom: () => Promise<string | null>
  joinRoom: (roomId: string) => Promise<boolean>
  leaveRoom: () => void
}

function buildShareUrl(roomId: string) {
  if (typeof window === "undefined") return `/?room=${encodeURIComponent(roomId)}`
  const url = new URL(window.location.href)
  url.searchParams.set("room", roomId)
  return url.toString()
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  roomId: null,
  shareUrl: null,
  state: "idle",
  error: null,

  createRoom: async () => {
    if (get().state === "creating-room") return get().roomId
    set({ state: "creating-room", error: null })

    try {
      const response = await fetch("/api/liveblocks/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      })
      const payload = (await response.json()) as { roomId?: string; error?: string }
      if (!response.ok || !payload.roomId) {
        throw new Error(payload.error ?? "Failed to create room")
      }

      const roomId = payload.roomId
      set({
        roomId,
        shareUrl: buildShareUrl(roomId),
        state: "ready",
        error: null,
      })
      return roomId
    } catch (error) {
      set({
        state: "error",
        error: error instanceof Error ? error.message : "Failed to create room",
      })
      return null
    }
  },

  joinRoom: async (roomId: string) => {
    const trimmed = roomId.trim()
    if (!trimmed) return false

    set({ state: "joining-room", error: null })
    try {
      const response = await fetch("/api/liveblocks/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", roomId: trimmed }),
      })
      const payload = (await response.json()) as { roomId?: string; error?: string }
      if (!response.ok || !payload.roomId) {
        throw new Error(payload.error ?? "Failed to join room")
      }

      set({
        roomId: payload.roomId,
        shareUrl: buildShareUrl(payload.roomId),
        state: "ready",
        error: null,
      })
      return true
    } catch (error) {
      set({
        state: "error",
        error: error instanceof Error ? error.message : "Failed to join room",
      })
      return false
    }
  },

  leaveRoom: () => {
    set({
      roomId: null,
      shareUrl: null,
      state: "idle",
      error: null,
    })
  },
}))


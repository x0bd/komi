const ROOM_PREFIX = "komi-room"

export function isValidRoomId(roomId: string) {
  return /^komi-room:[a-z0-9-]+$/i.test(roomId)
}

export function createRoomId() {
  return `${ROOM_PREFIX}:${crypto.randomUUID()}`
}


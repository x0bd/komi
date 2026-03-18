import { Liveblocks } from "@liveblocks/node"

let liveblocksSingleton: Liveblocks | null = null

export class LiveblocksConfigError extends Error {
  constructor() {
    super(
      "Missing LIVEBLOCKS_SECRET_KEY. Add it to .env.local before using Liveblocks APIs."
    )
    this.name = "LiveblocksConfigError"
  }
}

export function getLiveblocksServer() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new LiveblocksConfigError()
  }

  if (!liveblocksSingleton) {
    liveblocksSingleton = new Liveblocks({ secret })
  }

  return liveblocksSingleton
}

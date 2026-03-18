import { Liveblocks } from "@liveblocks/node"

export class LiveblocksConfigError extends Error {
  constructor() {
    super(
      "Missing LIVEBLOCKS_SECRET_KEY. Add it to .env.local before using Liveblocks APIs.",
    )
    this.name = "LiveblocksConfigError"
  }
}

let liveblocksServer: Liveblocks | null = null

export function getLiveblocksServer() {
  if (liveblocksServer) {
    return liveblocksServer
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY

  if (!secret) {
    throw new LiveblocksConfigError()
  }

  liveblocksServer = new Liveblocks({
    secret,
  })

  return liveblocksServer
}

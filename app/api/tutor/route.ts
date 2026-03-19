import { NextRequest, NextResponse } from "next/server"

type TutorRequestBody = {
  currentPlayer?: "black" | "white"
  moveNumber?: number
  lastMove?: {
    coordinate?: string
    isPass?: boolean
  }
  analysis?: {
    quality?: "best" | "strong" | "ok" | "mistake"
    winRate?: number
    suggestedCoordinate?: string | null
    summary?: string
    topMoves?: Array<{
      coordinate?: string
      reason?: string
    }>
  }
}

type TutorCacheEntry = {
  expiresAt: number
  message: string
}

const tutorCache = new Map<string, TutorCacheEntry>()
const CACHE_TTL_MS = 120_000
const CACHE_MAX_ENTRIES = 300

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function buildTutorMessage(body: TutorRequestBody) {
  const coordinate = body.lastMove?.coordinate ?? "that move"
  const isPass = body.lastMove?.isPass ?? false
  const quality = body.analysis?.quality ?? "ok"
  const winRate = Math.round(clamp01(body.analysis?.winRate ?? 0.5) * 100)
  const suggestion = body.analysis?.suggestedCoordinate
  const top = body.analysis?.topMoves?.[0]
  const phase =
    (body.moveNumber ?? 0) < 20 ? "opening" : (body.moveNumber ?? 0) < 110 ? "middle game" : "endgame"

  if (isPass) {
    return `Pass noted. In the ${phase}, only pass if every local fight is settled and you cannot gain secure points.`
  }

  if (quality === "best") {
    return `Excellent read at ${coordinate}. You are around ${winRate}% in control. Keep the same shape discipline on your next move.`
  }

  if (quality === "strong") {
    return `Strong move at ${coordinate}. Position reads near ${winRate}%. Next priority: connect weak stones before starting a new fight.`
  }

  if (quality === "mistake") {
    if (suggestion) {
      return `Playable at ${coordinate}, but ${suggestion} was cleaner here. Aim for connected shape first, then pressure.`
    }
    if (top?.coordinate) {
      return `That move at ${coordinate} was thin. Consider ${top.coordinate} (${top.reason ?? "better shape"}) in similar spots.`
    }
    return `That move at ${coordinate} was risky. Stabilize liberties first, then look for forcing moves.`
  }

  if (suggestion) {
    return `Move ${coordinate} is workable. ${suggestion} likely gave a cleaner follow-up line. Current pressure is about ${winRate}%.`
  }

  return `Move ${coordinate} keeps the game live. Maintain shape in this ${phase} and avoid creating new weak groups.`
}

function buildCacheKey(body: TutorRequestBody) {
  const top = body.analysis?.topMoves?.slice(0, 3) ?? []
  return JSON.stringify({
    moveNumber: body.moveNumber ?? 0,
    coordinate: body.lastMove?.coordinate ?? "",
    isPass: body.lastMove?.isPass ?? false,
    quality: body.analysis?.quality ?? "ok",
    winRate: Math.round(clamp01(body.analysis?.winRate ?? 0.5) * 100),
    suggestedCoordinate: body.analysis?.suggestedCoordinate ?? null,
    summary: body.analysis?.summary ?? "",
    topMoves: top.map((move) => ({
      coordinate: move.coordinate ?? "",
      reason: move.reason ?? "",
    })),
  })
}

function readCachedMessage(cacheKey: string) {
  const cached = tutorCache.get(cacheKey)
  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    tutorCache.delete(cacheKey)
    return null
  }

  return cached.message
}

function writeCachedMessage(cacheKey: string, message: string) {
  if (tutorCache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = tutorCache.keys().next().value
    if (firstKey) {
      tutorCache.delete(firstKey)
    }
  }

  tutorCache.set(cacheKey, {
    message,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as TutorRequestBody
  const cacheKey = buildCacheKey(body)
  const cachedMessage = readCachedMessage(cacheKey)
  if (cachedMessage) {
    return NextResponse.json({
      message: cachedMessage,
      source: "rule-based-cache",
    })
  }

  const message = buildTutorMessage(body)
  writeCachedMessage(cacheKey, message)

  return NextResponse.json({
    message,
    source: "rule-based",
  })
}

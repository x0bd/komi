import { NextRequest, NextResponse } from "next/server"

type TutorRequestBody = {
  question?: string
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

function buildAnswerForQuestion(question: string) {
  const q = question.trim().toLowerCase()
  if (!q) {
    return "Ask me about shape, captures, opening priorities, or endgame choices."
  }

  if (q.includes("opening")) {
    return "Opening rule: corners first, sides second, center last. Favor connected shapes over early fights."
  }
  if (q.includes("capture") || q.includes("atari")) {
    return "Before chasing a capture, count liberties for both groups. If your own chain gets thin, defend first."
  }
  if (q.includes("territory")) {
    return "Secure territory with stable borders first. Reductions are safer than deep invasions unless you have strong support."
  }
  if (q.includes("pass")) {
    return "Pass when no move gains secure points and local fights are settled. If a forcing move exists, keep initiative."
  }
  if (q.includes("ko")) {
    return "In ko fights, compare ko threats globally. Take ko only when your follow-up value beats the opponent’s threat value."
  }

  return "Good question. Prioritize connected shape, count liberties carefully, and choose moves that improve both safety and territory."
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
  if (typeof body.question === "string" && body.question.trim().length > 0) {
    const message = buildAnswerForQuestion(body.question)
    return NextResponse.json({
      message,
      source: "rule-based-qa",
    })
  }

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

import { NextRequest, NextResponse } from "next/server"

import { readJsonBody } from "@/lib/api/request-guards"
import { getApiDbUser } from "@/lib/auth/api"

type TutorRequestBody = {
  question?: string
  apiKey?: string
  stream?: boolean
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
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini"
const OPENAI_MODEL = process.env.OPENAI_TUTOR_MODEL?.trim() || DEFAULT_OPENAI_MODEL
const MAX_TUTOR_PAYLOAD_BYTES = 48_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 40

const tutorRateLimits = new Map<string, { resetAt: number; count: number }>()

function consumeTutorQuota(userId: string) {
  const now = Date.now()
  const current = tutorRateLimits.get(userId)

  if (!current || current.resetAt <= now) {
    tutorRateLimits.set(userId, {
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      count: 1,
    })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  current.count += 1
  return true
}

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

function buildOpenAIUserPrompt(body: TutorRequestBody) {
  if (typeof body.question === "string" && body.question.trim().length > 0) {
    return `User question: ${body.question.trim()}`
  }

  const coordinate = body.lastMove?.coordinate ?? "unknown"
  const quality = body.analysis?.quality ?? "ok"
  const winRate = Math.round(clamp01(body.analysis?.winRate ?? 0.5) * 100)
  const suggestion = body.analysis?.suggestedCoordinate ?? "none"
  const summary = body.analysis?.summary ?? "No summary."
  const topMoves =
    body.analysis?.topMoves?.slice(0, 3).map((move) => `${move.coordinate ?? "?"}: ${move.reason ?? "shape"}`).join(" | ") ??
    "No top moves."
  const moveNumber = body.moveNumber ?? 0

  return [
    `Move number: ${moveNumber}`,
    `Last move: ${coordinate}${body.lastMove?.isPass ? " (pass)" : ""}`,
    `Engine quality: ${quality}`,
    `Estimated win rate: ${winRate}%`,
    `Suggested coordinate: ${suggestion}`,
    `Engine summary: ${summary}`,
    `Top candidates: ${topMoves}`,
    "Write one compact coaching note for a beginner-intermediate Go player.",
  ].join("\n")
}

function extractOpenAIText(json: unknown) {
  if (!json || typeof json !== "object") return null

  const asRecord = json as Record<string, unknown>
  if (typeof asRecord.output_text === "string" && asRecord.output_text.trim()) {
    return asRecord.output_text.trim()
  }

  const output = asRecord.output
  if (!Array.isArray(output)) return null

  for (const item of output) {
    if (!item || typeof item !== "object") continue
    const content = (item as Record<string, unknown>).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (!part || typeof part !== "object") continue
      const text = (part as Record<string, unknown>).text
      if (typeof text === "string" && text.trim()) {
        return text.trim()
      }
    }
  }

  return null
}

async function requestOpenAIMessage(apiKey: string, body: TutorRequestBody) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_output_tokens: 180,
      temperature: 0.5,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are Sensei, a concise Go tutor. Give practical, non-verbose coaching with concrete next-step advice.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildOpenAIUserPrompt(body),
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    return null
  }

  const json = await response.json().catch(() => null)
  return extractOpenAIText(json)
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

function createStreamingTextResponse(message: string, source: string) {
  const encoder = new TextEncoder()
  const parts = message.split(/(\s+)/).filter((part) => part.length > 0)
  let cursor = 0

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (cursor >= parts.length) {
        controller.close()
        return
      }

      controller.enqueue(encoder.encode(parts[cursor]))
      cursor += 1
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Tutor-Source": source,
    },
  })
}

async function resolveTutorMessage(body: TutorRequestBody) {
  const apiKey =
    typeof body.apiKey === "string" && body.apiKey.trim().startsWith("sk-")
      ? body.apiKey.trim()
      : null

  if (apiKey) {
    const message = await requestOpenAIMessage(apiKey, body)
    if (message) {
      return {
        message,
        source: "openai-user-key",
      }
    }
  }

  if (typeof body.question === "string" && body.question.trim().length > 0) {
    return {
      message: buildAnswerForQuestion(body.question),
      source: "rule-based-qa",
    }
  }

  const cacheKey = buildCacheKey(body)
  const cachedMessage = readCachedMessage(cacheKey)
  if (cachedMessage) {
    return {
      message: cachedMessage,
      source: "rule-based-cache",
    }
  }

  const message = buildTutorMessage(body)
  writeCachedMessage(cacheKey, message)
  return {
    message,
    source: "rule-based",
  }
}

export async function POST(request: NextRequest) {
  const user = await getApiDbUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!consumeTutorQuota(user.id)) {
    return NextResponse.json(
      { error: "Too many tutor requests. Slow down and try again shortly." },
      { status: 429 },
    )
  }

  const parsedBody = await readJsonBody<TutorRequestBody>(
    request,
    MAX_TUTOR_PAYLOAD_BYTES,
  )
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: parsedBody.status },
    )
  }

  const body = parsedBody.body
  const resolved = await resolveTutorMessage(body)

  if (body.stream) {
    return createStreamingTextResponse(resolved.message, resolved.source)
  }

  return NextResponse.json({
    message: resolved.message,
    source: resolved.source,
  })
}

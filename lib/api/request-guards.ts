import type { NextRequest } from "next/server"

export type JsonReadResult<T> =
  | { ok: true; body: T }
  | { ok: false; status: number; error: string }

export async function readJsonBody<T>(
  request: NextRequest | Request,
  maxBytes: number,
): Promise<JsonReadResult<T>> {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const parsedLength = Number.parseInt(contentLength, 10)
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        error: `Payload too large. Limit is ${maxBytes} bytes.`,
      }
    }
  }

  let text: string
  try {
    text = await request.text()
  } catch {
    return { ok: false, status: 400, error: "Invalid request body" }
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      ok: false,
      status: 413,
      error: `Payload too large. Limit is ${maxBytes} bytes.`,
    }
  }

  if (!text.trim()) {
    return { ok: true, body: {} as T }
  }

  try {
    return { ok: true, body: JSON.parse(text) as T }
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON payload" }
  }
}

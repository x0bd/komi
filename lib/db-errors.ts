export function isDatabaseConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false

  const candidate = error as {
    code?: unknown
    message?: unknown
  }
  const message = typeof candidate.message === "string" ? candidate.message : ""

  return (
    candidate.code === "P1001" ||
    message.includes("Can't reach database server") ||
    message.includes("Error in PostgreSQL connection")
  )
}

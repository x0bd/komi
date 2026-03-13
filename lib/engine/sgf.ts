import type { Move } from "./types"

const SGF_LETTERS = "abcdefghijklmnopqrstuvwxyz"

function coordsToSGF(x: number, y: number): string {
  if (x < 0 || y < 0 || x > 25 || y > 25) return ""
  return SGF_LETTERS[x] + SGF_LETTERS[y]
}

export function gameToSGF(
  moves: Move[],
  metadata: {
    blackName?: string
    whiteName?: string
    size?: number
    komi?: number
    result?: string
    date?: string
  } = {}
): string {
  const size = metadata.size || 19
  const komi = metadata.komi || 6.5
  
  let header = `(;GM[1]FF[4]SZ[${size}]KM[${komi}]`
  if (metadata.blackName) header += `PB[${metadata.blackName}]`
  if (metadata.whiteName) header += `PW[${metadata.whiteName}]`
  if (metadata.result) header += `RE[${metadata.result}]`
  if (metadata.date) header += `DT[${metadata.date}]`
  
  let body = ""
  for (const move of moves) {
    const colorStr = move.player === "black" ? "B" : "W"
    const coordStr = move.isPass ? "" : coordsToSGF(move.x, move.y)
    body += `;${colorStr}[${coordStr}]`
  }
  
  return header + body + ")"
}

import { applyMove, applyPass } from "./rules"
import { createInitialState } from "./game"
import type { Move, ParsedSGFGame, PlayerColor, SGFMetadata } from "./types"

const SGF_LETTERS = "abcdefghijklmnopqrstuvwxyz"
const ROOT_PROPERTY_PATTERN = /([A-Z]{1,2})\[([^\]]*)\]/g
const MOVE_PATTERN = /;([BW])\[([a-z]{0,2})\]/g

function coordsToSGF(x: number, y: number): string {
  if (x < 0 || y < 0 || x > 25 || y > 25) return ""
  return SGF_LETTERS[x] + SGF_LETTERS[y]
}

function coordsFromSGF(coords: string) {
  if (coords.length !== 2) return null

  const x = SGF_LETTERS.indexOf(coords[0])
  const y = SGF_LETTERS.indexOf(coords[1])
  if (x < 0 || y < 0) return null

  return { x, y }
}

function escapeSGFValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\]/g, "\\]")
}

function unescapeSGFValue(value: string) {
  return value.replace(/\\\]/g, "]").replace(/\\\\/g, "\\")
}

export function gameToSGF(
  moves: Move[],
  metadata: SGFMetadata = {}
): string {
  const size = metadata.size ?? 19
  const komi = metadata.komi ?? 6.5
  
  let header = `(;GM[1]FF[4]SZ[${size}]KM[${komi}]`
  if (metadata.blackName) header += `PB[${escapeSGFValue(metadata.blackName)}]`
  if (metadata.whiteName) header += `PW[${escapeSGFValue(metadata.whiteName)}]`
  if (metadata.result) header += `RE[${escapeSGFValue(metadata.result)}]`
  if (metadata.date) header += `DT[${escapeSGFValue(metadata.date)}]`
  
  let body = ""
  for (const move of moves) {
    const colorStr = move.player === "black" ? "B" : "W"
    const coordStr = move.isPass ? "" : coordsToSGF(move.x, move.y)
    body += `;${colorStr}[${coordStr}]`
  }
  
  return header + body + ")"
}

export function sgfToGame(sgfString: string): ParsedSGFGame {
  const normalized = sgfString.trim()
  if (!normalized.startsWith("(;")) {
    throw new Error("Invalid SGF: expected root node")
  }

  const metadata: ParsedSGFGame["metadata"] = {
    size: 19,
    komi: 6.5,
  }

  const rootNode = normalized.match(/^\((;[^;()]*)/)?.[1] ?? ""
  let propertyMatch: RegExpExecArray | null = null
  while ((propertyMatch = ROOT_PROPERTY_PATTERN.exec(rootNode)) !== null) {
    const [, key, rawValue] = propertyMatch
    const value = unescapeSGFValue(rawValue)

    switch (key) {
      case "PB":
        metadata.blackName = value
        break
      case "PW":
        metadata.whiteName = value
        break
      case "RE":
        metadata.result = value
        break
      case "DT":
        metadata.date = value
        break
      case "SZ": {
        const parsedSize = Number.parseInt(value, 10)
        if (Number.isFinite(parsedSize) && parsedSize > 0) {
          metadata.size = parsedSize
        }
        break
      }
      case "KM": {
        const parsedKomi = Number.parseFloat(value)
        if (Number.isFinite(parsedKomi)) {
          metadata.komi = parsedKomi
        }
        break
      }
      default:
        break
    }
  }

  const moves: Move[] = []
  let state = createInitialState(metadata.size)
  let moveMatch: RegExpExecArray | null = null

  while ((moveMatch = MOVE_PATTERN.exec(normalized)) !== null) {
    const [, moveColor, moveValue] = moveMatch
    const player = (moveColor === "B" ? "black" : "white") as PlayerColor

    if (moveValue === "") {
      state = applyPass(state)
      moves.push({ x: -1, y: -1, player, isPass: true })
      continue
    }

    const coords = coordsFromSGF(moveValue)
    if (!coords) {
      throw new Error(`Invalid SGF move coordinates: ${moveValue}`)
    }

    const nextState = applyMove(state, metadata.size, coords.x, coords.y, player)
    if (!nextState) {
      throw new Error(
        `Invalid SGF move for ${player} at ${moveValue} on move ${moves.length + 1}`,
      )
    }

    state = nextState
    moves.push({ x: coords.x, y: coords.y, player, isPass: false })
  }

  return { metadata, moves, state }
}

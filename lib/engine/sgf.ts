import { applyMove, applyPass } from "./rules"
import { createInitialState } from "./game"
import type { Move, ParsedSGFGame, PlayerColor, SGFMetadata } from "./types"

const SGF_LETTERS = "abcdefghijklmnopqrstuvwxyz"
const MAX_SGF_BOARD_SIZE = SGF_LETTERS.length

type SGFProperty = {
  key: string
  values: string[]
}

type SGFNode = SGFProperty[]

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

function skipWhitespace(source: string, index: number) {
  while (index < source.length && /\s/.test(source[index])) {
    index++
  }
  return index
}

function isPropertyNameChar(char: string | undefined) {
  return Boolean(char && char >= "A" && char <= "Z")
}

function parseSGFValue(source: string, index: number) {
  if (source[index] !== "[") {
    throw new Error("Invalid SGF: expected property value")
  }

  let value = ""
  index++

  while (index < source.length) {
    const char = source[index]

    if (char === "\\") {
      if (index + 1 >= source.length) {
        throw new Error("Invalid SGF: unterminated escaped value")
      }

      value += source[index + 1]
      index += 2
      continue
    }

    if (char === "]") {
      return { value, nextIndex: index + 1 }
    }

    value += char
    index++
  }

  throw new Error("Invalid SGF: unterminated property value")
}

function parseSGFNode(source: string, index: number) {
  if (source[index] !== ";") {
    throw new Error("Invalid SGF: expected node")
  }

  const node: SGFNode = []
  index++

  while (index < source.length) {
    index = skipWhitespace(source, index)
    const char = source[index]

    if (!char || char === ";" || char === "(" || char === ")") {
      break
    }

    if (!isPropertyNameChar(char)) {
      throw new Error(`Invalid SGF: unexpected token "${char}" in node`)
    }

    let key = ""
    while (isPropertyNameChar(source[index])) {
      key += source[index]
      index++
    }

    const values: string[] = []
    index = skipWhitespace(source, index)
    if (source[index] !== "[") {
      throw new Error(`Invalid SGF: property ${key} is missing a value`)
    }

    while (source[index] === "[") {
      const parsed = parseSGFValue(source, index)
      values.push(parsed.value)
      index = skipWhitespace(source, parsed.nextIndex)
    }

    node.push({ key, values })
  }

  return { node, nextIndex: index }
}

function parseMainLine(source: string) {
  let index = skipWhitespace(source, 0)
  if (source[index] !== "(") {
    throw new Error("Invalid SGF: expected collection")
  }

  index = skipWhitespace(source, index + 1)
  const root = parseSGFNode(source, index)
  index = root.nextIndex

  const moveNodes: SGFNode[] = []

  while (index < source.length) {
    index = skipWhitespace(source, index)
    const char = source[index]

    if (char === ";") {
      const parsed = parseSGFNode(source, index)
      moveNodes.push(parsed.node)
      index = parsed.nextIndex
      continue
    }

    if (char === "(") {
      throw new Error("Unsupported SGF: variations are not supported yet")
    }

    if (char === ")") {
      index = skipWhitespace(source, index + 1)
      if (index !== source.length) {
        throw new Error("Invalid SGF: unexpected content after collection")
      }
      return { root: root.node, moveNodes }
    }

    throw new Error("Invalid SGF: unterminated collection")
  }

  throw new Error("Invalid SGF: unterminated collection")
}

function getFirstPropertyValue(node: SGFNode, key: string) {
  const property = node.find((entry) => entry.key === key)
  return property?.values[0]
}

function parseBoardSize(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid SGF board size: ${value}`)
  }

  const size = Number(value)
  if (!Number.isInteger(size) || size < 1 || size > MAX_SGF_BOARD_SIZE) {
    throw new Error(`Invalid SGF board size: ${value}`)
  }

  return size
}

function parseKomi(value: string) {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
    throw new Error(`Invalid SGF komi: ${value}`)
  }

  const komi = Number(value)
  if (!Number.isFinite(komi)) {
    throw new Error(`Invalid SGF komi: ${value}`)
  }

  return komi
}

function getMoveProperty(node: SGFNode) {
  const moveProperties = node.filter(
    (property) => property.key === "B" || property.key === "W",
  )

  if (moveProperties.length > 1) {
    throw new Error("Invalid SGF: node contains multiple moves")
  }

  const moveProperty = moveProperties[0]
  if (!moveProperty) {
    return null
  }

  if (moveProperty.values.length !== 1) {
    throw new Error(`Invalid SGF: move ${moveProperty.key} must have one value`)
  }

  return moveProperty
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
  const { root, moveNodes } = parseMainLine(normalized)

  const metadata: ParsedSGFGame["metadata"] = {
    size: 19,
    komi: 6.5,
  }

  const blackName = getFirstPropertyValue(root, "PB")
  if (blackName !== undefined) metadata.blackName = blackName

  const whiteName = getFirstPropertyValue(root, "PW")
  if (whiteName !== undefined) metadata.whiteName = whiteName

  const result = getFirstPropertyValue(root, "RE")
  if (result !== undefined) metadata.result = result

  const date = getFirstPropertyValue(root, "DT")
  if (date !== undefined) metadata.date = date

  const boardSize = getFirstPropertyValue(root, "SZ")
  if (boardSize !== undefined) metadata.size = parseBoardSize(boardSize)

  const komi = getFirstPropertyValue(root, "KM")
  if (komi !== undefined) metadata.komi = parseKomi(komi)

  if (metadata.size > MAX_SGF_BOARD_SIZE) {
    throw new Error(`Unsupported SGF board size: ${metadata.size}`)
  }

  const moves: Move[] = []
  let state = createInitialState(metadata.size)

  for (const node of moveNodes) {
    const moveProperty = getMoveProperty(node)
    if (!moveProperty) {
      continue
    }

    const moveValue = moveProperty.values[0]
    const player = (moveProperty.key === "B" ? "black" : "white") as PlayerColor

    if (moveValue === "") {
      state = applyPass(state)
      moves.push({ x: -1, y: -1, player, isPass: true })
      continue
    }

    const coords = coordsFromSGF(moveValue)
    if (!coords) {
      throw new Error(`Invalid SGF move coordinates: ${moveValue}`)
    }

    if (coords.x >= metadata.size || coords.y >= metadata.size) {
      throw new Error(
        `Invalid SGF move ${moveValue}: outside ${metadata.size}x${metadata.size} board`,
      )
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

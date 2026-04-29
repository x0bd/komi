export const SUPPORTED_BOARD_SIZES = [9, 13, 19] as const

export type BoardSize = (typeof SUPPORTED_BOARD_SIZES)[number]

export function isSupportedBoardSize(value: unknown): value is BoardSize {
  return typeof value === "number" && SUPPORTED_BOARD_SIZES.includes(value as BoardSize)
}

export function normalizeBoardSize(value: unknown, fallback: BoardSize = 19): BoardSize {
  return isSupportedBoardSize(value) ? value : fallback
}

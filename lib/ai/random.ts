import type { GameState, PlayerColor } from "../engine/types"
import { getActiveEngineProvider } from "./index"
import type { EngineDifficulty, EngineSearchBudget } from "./engine-provider"

type LegacyDifficulty = "easy" | "medium" | "hard"

function toSearchBudget(difficulty: LegacyDifficulty): EngineSearchBudget {
  if (difficulty === "hard") return "deep"
  if (difficulty === "medium") return "standard"
  return "fast"
}

export async function getRandomAIMove(
  state: GameState,
  size: number,
  player: PlayerColor,
  difficulty: LegacyDifficulty = "easy",
): Promise<{ x: number; y: number; isPass: boolean }> {
  const provider = getActiveEngineProvider()
  return provider.pickMove({
    state,
    size,
    player,
    difficulty: difficulty as EngineDifficulty,
    searchBudget: toSearchBudget(difficulty),
    withDelay: true,
  })
}

import type { GameState, PlayerColor } from "../engine/types"
import { getActiveEngineProvider } from "./index"
import type { EngineDifficulty } from "./engine-provider"

type LegacyDifficulty = "easy" | "medium" | "hard"

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
    withDelay: true,
  })
}

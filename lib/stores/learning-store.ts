import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type ChatMessage } from "../../components/learning/ai-chat-panel"

type StreakEvent =
  | { type: "player-stone" }
  | { type: "player-capture"; count: number }
  | { type: "opponent-stone" }
  | { type: "opponent-capture"; count: number }
  | { type: "player-pass" }
  | { type: "opponent-pass" }
  | { type: "player-win" }
  | { type: "player-loss" }

interface LearningStore {
  // Gamification
  xp: number
  streak: number
  level: number
  liveStreak: number
  lastStreakEvent: string
  lastStreakDelta: number
  streakPulseKey: number
  
  // AI Chat
  chatMessages: ChatMessage[]
  
  // Actions
  addXP: (amount: number) => void
  registerStreakEvent: (event: StreakEvent) => void
  resetLiveStreak: () => void
  addMessage: (text: string) => void
  requestTip: (topic: string) => void
  clearMessages: () => void
}

const LEVEL_THRESHOLD = 1000
const LIVE_STREAK_BASELINE = 24

function clampLiveStreak(value: number) {
  return Math.max(0, Math.min(100, value))
}

function getStreakMeta(event: StreakEvent) {
  switch (event.type) {
    case "player-stone":
      return { delta: 4, label: "Shape building" }
    case "player-capture":
      return {
        delta: Math.min(24, 8 + event.count * 4),
        label: event.count > 1 ? `Killer move +${event.count}` : "Killer move",
      }
    case "opponent-stone":
      return { delta: -2, label: "Opponent pressure" }
    case "opponent-capture":
      return {
        delta: -Math.min(24, 8 + event.count * 4),
        label: event.count > 1 ? `Under attack -${event.count}` : "Under attack",
      }
    case "player-pass":
      return { delta: -6, label: "Tempo lost" }
    case "opponent-pass":
      return { delta: 5, label: "Opponent blinked" }
    case "player-win":
      return { delta: 14, label: "Board secured" }
    case "player-loss":
      return { delta: -14, label: "Momentum broken" }
  }
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      level: 1,
      liveStreak: LIVE_STREAK_BASELINE,
      lastStreakEvent: "Fresh board",
      lastStreakDelta: 0,
      streakPulseKey: 0,
      chatMessages: [
        { id: "msg-0", text: "Konnichiwa! I am Sensei. I will help guide you through the game." }
      ],

      addXP: (amount) => {
        set((state) => {
          let newXp = state.xp + amount
          let newLevel = state.level
          let newStreak = state.streak

          // Simple static streak increment on arbitrary XP events for now
          if (amount > 0) newStreak += 1

          if (newXp >= LEVEL_THRESHOLD) {
            newLevel += Math.floor(newXp / LEVEL_THRESHOLD)
            newXp = newXp % LEVEL_THRESHOLD
          }

          return { xp: newXp, level: newLevel, streak: newStreak }
        })
      },

      registerStreakEvent: (event) => {
        const { delta, label } = getStreakMeta(event)

        set((state) => ({
          liveStreak: clampLiveStreak(state.liveStreak + delta),
          lastStreakEvent: label,
          lastStreakDelta: delta,
          streakPulseKey: state.streakPulseKey + 1,
        }))
      },

      resetLiveStreak: () =>
        set({
          liveStreak: LIVE_STREAK_BASELINE,
          lastStreakEvent: "Fresh board",
          lastStreakDelta: 0,
          streakPulseKey: 0,
        }),

      addMessage: (text) => {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          text
        }
        set((state) => ({
          chatMessages: [...state.chatMessages, newMessage]
        }))
      },

      requestTip: (topic) => {
        const { addMessage } = get()
        
        switch (topic) {
          case "Opening tips":
            addMessage("In the opening, prioritize the corners first. They are the easiest places to surround territory. The sequence goes: Corners, Sides, then center.")
            break
          case "How to capture":
            addMessage("To capture a stone, you must surround it completely by filling all of its adjacent empty intersections (liberties).")
            break
          case "Territory":
            addMessage("Points are scored by surrounding empty intersections with your stones. Focus on building secure borders!")
            break
          default:
            addMessage(`I don't have a specific tip for "${topic}" yet, but keep practicing!`)
        }
      },

      clearMessages: () => set({ chatMessages: [] })
    }),
    {
      name: "komi-learning-storage",
      partialize: (state) => ({ xp: state.xp, streak: state.streak, level: state.level }) // Only persist gamification stats
    }
  )
)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type ChatMessage } from "../../components/learning/ai-chat-panel"

interface LearningStore {
  // Gamification
  xp: number
  streak: number
  level: number
  
  // AI Chat
  chatMessages: ChatMessage[]
  
  // Actions
  addXP: (amount: number) => void
  addMessage: (text: string) => void
  requestTip: (topic: string) => void
  clearMessages: () => void
}

const LEVEL_THRESHOLD = 1000

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      level: 1,
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

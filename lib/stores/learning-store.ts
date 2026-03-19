import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type ChatMessage } from "../../components/learning/ai-chat-panel"

type TutorAnalysisMove = {
  coordinate: string
  confidence: number
  score: number
  reason: string
  tags: string[]
}

export type TutorAnalysisSnapshot = {
  actor: "player" | "opponent"
  moveCoordinate: string
  suggestedCoordinate: string | null
  quality: "best" | "strong" | "ok" | "mistake"
  winRate: number
  summary: string
  topMoves: TutorAnalysisMove[]
}

type StreakEvent =
  | { type: "player-stone" }
  | { type: "player-capture"; count: number }
  | { type: "opponent-stone" }
  | { type: "opponent-capture"; count: number }
  | { type: "player-pass" }
  | { type: "opponent-pass" }
  | { type: "player-win" }
  | { type: "player-loss" }

type TutorEvent =
  | { type: "player-stone"; coordinate: string }
  | { type: "player-capture"; count: number; coordinate: string }
  | { type: "opponent-stone"; coordinate: string }
  | { type: "opponent-capture"; count: number; coordinate: string }
  | {
      type: "analysis"
      actor: "player" | "opponent"
      moveCoordinate: string
      suggestedCoordinate: string | null
      quality: "best" | "strong" | "ok" | "mistake"
      winRate: number
      summary: string
      topMoves: TutorAnalysisMove[]
    }
  | { type: "player-pass" }
  | { type: "opponent-pass" }
  | { type: "player-win" }
  | { type: "player-loss" }
  | { type: "reset" }

interface LearningStore {
  // Gamification
  xp: number
  streak: number
  level: number
  liveStreak: number
  lastStreakEvent: string
  lastStreakDelta: number
  streakPulseKey: number
  tutorMood: "calm" | "focus" | "warning" | "celebrate"
  tutorGoal: string
  tutorCue: string
  latestAnalysis: TutorAnalysisSnapshot | null
  tutorPulseKey: number
  tutorEventCount: number
  tipFlags: {
    opening: boolean
    firstCapture: boolean
    territory: boolean
  }
  
  // AI Chat
  chatMessages: ChatMessage[]
  
  // Actions
  addXP: (amount: number) => void
  registerStreakEvent: (event: StreakEvent) => void
  registerTutorEvent: (event: TutorEvent) => void
  resetLiveStreak: () => void
  addMessage: (text: string, tone?: ChatMessageTone) => void
  requestTip: (topic: string) => void
  markTipShown: (tip: "opening" | "firstCapture" | "territory") => void
  clearMessages: () => void
}

const LEVEL_THRESHOLD = 1000
const LIVE_STREAK_BASELINE = 24
const MAX_CHAT_MESSAGES = 28

function pushChatMessage(
  messages: ChatMessage[],
  text: string,
  tone: ChatMessage["tone"] = "coach"
) {
  const next = [...messages, { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, tone }]
  if (next.length <= MAX_CHAT_MESSAGES) return next
  return next.slice(next.length - MAX_CHAT_MESSAGES)
}

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

function getTutorMeta(event: TutorEvent, eventCount: number) {
  switch (event.type) {
    case "analysis": {
      const winRate = Math.round(Math.max(0, Math.min(1, event.winRate)) * 100)

      if (event.actor === "player") {
        if (event.quality === "best") {
          return {
            mood: "celebrate" as const,
            goal: "Excellent read. Keep converting local wins into territory.",
            cue: `Engine approves ${event.moveCoordinate}. Keep your shape connected.`,
            message:
              eventCount % 2 === 0
                ? `Strong read at ${event.moveCoordinate}. Win pressure now around ${winRate}%.`
                : null,
            tone: "celebrate" as const,
          }
        }

        if (event.quality === "mistake") {
          return {
            mood: "warning" as const,
            goal: "Stabilize shape before forcing the next fight.",
            cue: event.suggestedCoordinate
              ? `Playable, but ${event.suggestedCoordinate} was cleaner than ${event.moveCoordinate}.`
              : `Playable move at ${event.moveCoordinate}, but there was a stronger option nearby.`,
            message: event.suggestedCoordinate
              ? `At ${event.moveCoordinate}, shape got thin. Consider ${event.suggestedCoordinate} in similar positions.`
              : `That move at ${event.moveCoordinate} weakened tempo. Prioritize shape first.`,
            tone: "warning" as const,
          }
        }

        return {
          mood: "focus" as const,
          goal: "Keep building efficient shape and tempo.",
          cue: `Move ${event.moveCoordinate} is workable. Estimated pressure ${winRate}%.`,
          message: eventCount % 3 === 0 ? `Good pace. ${winRate}% pressure after ${event.moveCoordinate}.` : null,
          tone: "coach" as const,
        }
      }

      if (event.quality === "mistake") {
        return {
          mood: "celebrate" as const,
          goal: "Punish inaccuracy with forcing moves.",
          cue: `Opponent drifted at ${event.moveCoordinate}. Look for sente first.`,
          message:
            eventCount % 3 === 0
              ? `Opponent slipped at ${event.moveCoordinate}. Clean punish opportunity now.`
              : null,
          tone: "celebrate" as const,
        }
      }

      if (event.quality === "best") {
        return {
          mood: "warning" as const,
          goal: "Respect strong opponent shape and defend weak groups.",
          cue: `Opponent found a precise move at ${event.moveCoordinate}.`,
          message:
            eventCount % 4 === 0
              ? `Opponent read was strong at ${event.moveCoordinate}. Stabilize before counter-attacking.`
              : null,
          tone: "warning" as const,
        }
      }

      return {
        mood: "focus" as const,
        goal: "Track opponent intent and answer with shape.",
        cue: `Opponent played ${event.moveCoordinate}. Stay connected and avoid over-fighting.`,
        message: null,
        tone: "coach" as const,
      }
    }
    case "player-capture":
      return {
        mood: "celebrate" as const,
        goal: "Great capture. Convert this into stable territory.",
        cue: `At ${event.coordinate}, reinforce your surrounding shape before chasing more stones.`,
        message:
          event.count > 1
            ? `Huge swing at ${event.coordinate}. Nice ${event.count}-stone capture. Lock the boundary first.`
            : `Sharp capture at ${event.coordinate}. Keep that group thick and force the next sente move.`,
        tone: "celebrate" as const,
      }
    case "opponent-capture":
      return {
        mood: "warning" as const,
        goal: "Stabilize weak groups before expanding elsewhere.",
        cue: `You lost stones near ${event.coordinate}. Recover liberties and connect.`,
        message:
          event.count > 1
            ? `That was a painful ${event.count}-stone loss near ${event.coordinate}. Defend first, then counter.`
            : `Pressure spike near ${event.coordinate}. Secure your weak chain before the next fight.`,
        tone: "warning" as const,
      }
    case "player-pass":
      return {
        mood: "warning" as const,
        goal: "Make your next move claim or secure points.",
        cue: "A pass gives initiative away. Look for a forcing move on your next turn.",
        message: "Passing can be fine late game. Right now, prioritize one move that gains secure points.",
        tone: "warning" as const,
      }
    case "opponent-pass":
      return {
        mood: "focus" as const,
        goal: "Take initiative while your opponent paused.",
        cue: "Play the most valuable point on the board now.",
        message: "Opponent passed. This is your tempo window. Play the biggest point immediately.",
        tone: "coach" as const,
      }
    case "player-win":
      return {
        mood: "celebrate" as const,
        goal: "Review key turning points and keep the momentum.",
        cue: "Winning shape came from efficient liberties and timing.",
        message: "Well played. You controlled momentum and converted it. Let’s carry that pattern forward.",
        tone: "celebrate" as const,
      }
    case "player-loss":
      return {
        mood: "calm" as const,
        goal: "Rebuild from fundamentals: shape, liberties, and timing.",
        cue: "One clean defensive sequence can change the next game.",
        message: "Good learning game. We reset and focus on stronger connections in the next opening.",
        tone: "coach" as const,
      }
    case "reset":
      return {
        mood: "focus" as const,
        goal: "Open with corner priority and connected shape.",
        cue: "Corners first, sides second, center last.",
        message: "New board. Let’s build efficient shape from the corners and avoid early overreach.",
        tone: "coach" as const,
      }
    case "player-stone":
      return {
        mood: "focus" as const,
        goal: "Build influence while keeping your stones connected.",
        cue: `Good placement at ${event.coordinate}. Keep your next move nearby unless there is a major threat.`,
        message:
          eventCount % 4 === 0
            ? `Nice rhythm. Move ${event.coordinate} keeps pressure steady.`
            : null,
        tone: "coach" as const,
      }
    case "opponent-stone":
      return {
        mood: "focus" as const,
        goal: "Answer pressure with shape, not panic.",
        cue: `Opponent played ${event.coordinate}. Check for cuts and weak points first.`,
        message:
          eventCount % 5 === 0
            ? `Opponent is probing ${event.coordinate}. Stay connected and only fight where you’re strong.`
            : null,
        tone: "coach" as const,
      }
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
      tutorMood: "focus",
      tutorGoal: "Open from the corners and keep groups connected.",
      tutorCue: "Play shape first, then attack.",
      latestAnalysis: null,
      tutorPulseKey: 0,
      tutorEventCount: 0,
      tipFlags: {
        opening: false,
        firstCapture: false,
        territory: false,
      },
      chatMessages: [
        { id: "msg-0", text: "Konnichiwa! I am Sensei. I will coach your decisions move by move.", tone: "coach" },
        { id: "msg-1", text: "Opening tip: take corners first, then sides, and keep your stones connected.", tone: "tip" },
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

      registerTutorEvent: (event) => {
        set((state) => {
          const nextEventCount = state.tutorEventCount + 1
          const meta = getTutorMeta(event, nextEventCount)
          const nextMessages =
            meta.message === null
              ? state.chatMessages
              : pushChatMessage(state.chatMessages, meta.message, meta.tone)

          return {
            tutorMood: meta.mood,
            tutorGoal: meta.goal,
            tutorCue: meta.cue,
            latestAnalysis:
              event.type === "analysis"
                ? {
                    actor: event.actor,
                    moveCoordinate: event.moveCoordinate,
                    suggestedCoordinate: event.suggestedCoordinate,
                    quality: event.quality,
                    winRate: event.winRate,
                    summary: event.summary,
                    topMoves: event.topMoves.map((move) => ({ ...move })),
                  }
                : event.type === "reset"
                  ? null
                  : state.latestAnalysis,
            tutorPulseKey: state.tutorPulseKey + 1,
            tutorEventCount: nextEventCount,
            chatMessages: nextMessages,
          }
        })
      },

      resetLiveStreak: () =>
        set({
          liveStreak: LIVE_STREAK_BASELINE,
          lastStreakEvent: "Fresh board",
          lastStreakDelta: 0,
          streakPulseKey: 0,
          tutorMood: "focus",
          tutorGoal: "Open from the corners and keep groups connected.",
          tutorCue: "Play shape first, then attack.",
          latestAnalysis: null,
          tutorPulseKey: 0,
          tutorEventCount: 0,
          tipFlags: {
            opening: false,
            firstCapture: false,
            territory: false,
          },
        }),

      addMessage: (text, tone = "tip") => {
        set((state) => ({
          chatMessages: pushChatMessage(state.chatMessages, text, tone)
        }))
      },

      requestTip: (topic) => {
        const { addMessage } = get()
        
        switch (topic) {
          case "Opening tips":
            addMessage("Opening tip: take corners first, then sides, and keep your stones connected.")
            break
          case "How to capture":
            addMessage("Capture by taking all liberties of a group. Count liberties before you fight.")
            break
          case "Territory":
            addMessage("Secure territory with stable borders first, then reduce your opponent's weak areas.")
            break
          default:
            addMessage(`I don't have a specific tip for "${topic}" yet, but keep practicing!`)
        }
      },

      markTipShown: (tip) =>
        set((state) => ({
          tipFlags: {
            ...state.tipFlags,
            [tip]: true,
          },
        })),

      clearMessages: () => set({ chatMessages: [] })
    }),
    {
      name: "komi-learning-storage",
      partialize: (state) => ({ xp: state.xp, streak: state.streak, level: state.level }) // Only persist gamification stats
    }
  )
)

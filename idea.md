# Komi

Komi is a modern multiplayer implementation of the ancient board game **Go**, designed for the web with a focus on elegance, learning, and real-time play. The platform combines competitive matches, AI-assisted learning, and a polished interactive interface.

The name *Komi* refers to the points given to the white player in Go to compensate for black’s first-move advantage, symbolizing balance and fairness in gameplay.

Komi aims to provide:
- Real-time multiplayer Go matches
- A clean, responsive board interface
- An AI tutor that teaches strategy and explains moves
- Game analysis powered by modern Go engines
- Replayable match history using standard Go formats

The project is built as a design-engineered product, prioritizing performance, clarity, and expressive UI.

---

# Core Features

## Multiplayer Gameplay
- Real-time matches between players
- Turn-based synchronization across clients
- Room-based game sessions
- Presence indicators and move broadcasting

## AI Tutor
- Interactive AI assistant similar to Duolingo’s learning model
- Explains moves, mistakes, and better alternatives
- Provides strategic insights and teaching moments
- Powered by Go engine analysis + LLM explanations

## Game Analysis
- Territory prediction
- Win probability evaluation
- Move suggestions
- Post-game review

## Replay System
- Games stored and replayable
- Move-by-move timeline navigation
- Export using SGF (Smart Game Format)

## Visual Experience
- Smooth stone placement animations
- Minimalist board design
- Responsive layout for desktop and mobile

---

# Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Zustand (state management)
- TanStack Query (data fetching)
- Framer Motion (animations)
- Three.js (board rendering and visual effects)

## Realtime Multiplayer
- Liveblocks (shared state synchronization)
- WebSocket-backed room architecture

## Game Engine
- TypeScript rules engine for:
  - liberties
  - captures
  - ko rule
  - scoring
- Optional Rust + WebAssembly engine for high-performance calculations

## AI Systems
- KataGo (Go engine analysis)
- OpenAI API (AI tutor explanations)

## Backend & Database
- Neon (serverless PostgreSQL)
- Prisma ORM

## Authentication
- Neon Auth

## Storage / Match State
- Liveblocks room storage
- Optional Redis for matchmaking queues and caching

## Infrastructure
- Vercel (frontend deployment)
- Fly.io or Cloudflare (game services / AI engine hosting)

---

# Data Formats

- SGF (Smart Game Format) for storing and exporting games
- JSON board state for realtime synchronization

Example board representation:

```ts
type Stone = 0 | 1 | 2
// 0 = empty
// 1 = black
// 2 = white

type GameState = {
  board: Stone[]
  turn: "black" | "white"
  moveNumber: number
  captured: {
    black: number
    white: number
  }
}
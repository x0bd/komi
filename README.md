# Komi

A modern multiplayer implementation of **Go**, designed for the web with a focus on elegance, learning, and real-time play.

The name *Komi* refers to the points given to the white player in Go to compensate for black's first-move advantage — a symbol of balance and fairness in gameplay.

## What It Does

- **Real-time multiplayer** — Room-based Go matches with turn synchronization and presence indicators
- **AI tutor** — A Duolingo-style assistant that explains moves, mistakes, and strategy using engine analysis + LLM explanations
- **Game analysis** — Territory prediction, win probability, move suggestions, and post-game review
- **Replay system** — Move-by-move timeline navigation with SGF export
- **Polished UI** — Smooth stone animations, warm tactile board, responsive layout across devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (`base-maia`) |
| State | Zustand |
| Data Fetching | TanStack Query |
| Animation | GSAP, tw-animate-css |
| Icons | Hugeicons |
| Realtime | Liveblocks |
| Game Engine | TypeScript rules engine (liberties, captures, ko, scoring) |
| AI Analysis | KataGo + OpenAI API |
| Database | Neon (serverless PostgreSQL) + Prisma ORM |
| Auth | Neon Auth |
| Deployment | Vercel (frontend), Fly.io / Cloudflare (game services) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/                  # Next.js app router pages and layouts
components/
├── ui/               # shadcn/ui primitives (auto-generated)
├── game/             # board, stones, player cards, timers, controls
├── learning/         # AI tutor chat, XP bar, tip system
└── layout/           # page structure, responsive containers
lib/                  # utilities, game engine, helpers
hooks/                # custom React hooks
public/               # static assets, visual inspiration references
```

## Design

The visual identity is **modern wabi-sabi** — warm, earthy tones honoring Go's tradition, paired with clean spatial hierarchy and tactile micro-interactions.

See [`design-sys.md`](./design-sys.md) for the full design system covering colors, typography, component patterns, animation specs, and shadcn/ui integration.

## Data Format

Games use a flat board representation for real-time sync and SGF for storage/export:

```ts
type Stone = 0 | 1 | 2   // empty, black, white

type GameState = {
  board: Stone[]
  turn: "black" | "white"
  moveNumber: number
  captured: { black: number; white: number }
}
```

## License

Private project.

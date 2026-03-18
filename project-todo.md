# Komi — Implementation Roadmap

Step-by-step build plan. UI first, then game logic, then integrations.

---

## Phase 1: Foundation & Design System Setup

- [x] **Typography & fonts**
  - [x] Replace Geist/Figtree with Bricolage Grotesque, DM Sans, JetBrains Mono in `layout.tsx`
  - [x] Map font variables (`--font-display`, `--font-body`, `--font-mono`) in `globals.css`
  - [x] Update `@theme inline` block with new font references
- [x] **Color tokens**
  - [x] Replace default shadcn neutral palette with Komi washi palette (`:root` and `.dark`) in `globals.css`
  - [x] Add game-specific extended tokens (board, stones, status, tutor, xp)
  - [x] Washi light theme (cream parchment, sumi ink, honey wood, kintsugi gold)
  - [x] Sumi-e dark theme (cool slate, ivory text, desaturated wood, no brown in chrome)
- [x] **Metadata**
  - [x] Update `layout.tsx` metadata — title, description
- [x] **Tailwind extensions**
  - [x] Add `grid-cols-19` / `grid-rows-19` custom values
  - [x] Add stone-place / stone-capture / pulse-gentle / marker-appear keyframe animations
  - [x] Add `.board-texture` utility class
- [x] **shadcn component theming**
  - [x] Verify Button, Card, Badge render correctly with new tokens
  - [x] Add `accent` button variant
- [x] **Infrastructure**
  - [x] Wire `next-themes` provider (`components/providers.tsx`)
  - [x] Fix pre-existing `spinner.tsx` type error

---

## Phase 2: Layout Shell

- [x] **Game layout component** (`components/layout/game-layout.tsx`)
  - [x] Two-column flex layout (board area + sidebar)
  - [x] Responsive breakpoints — side-by-side on desktop (`lg:`), stacked on mobile
  - [x] Board area: flex-1, centered content
  - [x] Sidebar: fixed width 380px on desktop, full-width on mobile
  - [x] Sidebar scrollable when content overflows (`max-h-[calc(100svh-8rem)]`)
  - [x] Vertical centering fixed — `flex-1` main area with `items-center justify-center`, board+sidebar pair centered in viewport
  - [x] Floating topbar: absolute-positioned header with Komi wordmark (left) and theme toggle (right)
- [x] **Page route** (`app/page.tsx`)
  - [x] Replace boilerplate with `<GameLayout />` shell
  - [x] Washi background with placeholder board and sidebar
  - [x] Board placeholder: 19×19 grid with stones, hoshi points, coordinates, last-move marker
  - [x] Sidebar placeholder: mode toggle, player cards, move history, controls
- [x] **Background decoration** (`WashiTexture` component)
  - [x] SVG fractal noise overlay for washi paper grain
  - [x] Ambient gradient blobs (warm accent + sage, adapts to dark mode)
- [x] **Theme toggle** (`components/ui/theme-toggle.tsx`)
  - [x] `useTheme` from `next-themes` — reads and sets light/dark
  - [x] `Sun01Icon` / `Moon01Icon` from `@hugeicons/core-free-icons` via `HugeiconsIcon`
  - [x] Spring-easing icon swap animation (slide + rotate in/out)
  - [x] Hydration-safe `mounted` guard
  - [x] Frosted-glass pill button with hover scale + shadow

---

## Phase 3: Board UI (Visual Only)

- [x] **Board container** (`components/game/go-board.tsx`)
  - [x] Outer frame div — rounded-3xl, board-frame background, deep layered shadow
  - [x] Inner surface div — rounded-2xl, board-surface background
  - [x] Subtle wood grain texture via `.board-texture`
  - [x] Layout rewritten as proper 2×2 CSS grid — corner, top labels, left labels, board as direct children (no fragment)
  - [x] All grid templates use inline `style` props — no dependency on Tailwind `grid-cols-19` class generation
  - [x] Board colors updated: light = washi cream (`oklch(0.925 0.018 82)`), dark = cool slate (`oklch(0.21 0.007 260)`) — no more brown/wood
- [x] **Grid layer** (SVG)
  - [x] 19 vertical lines, 19 horizontal lines, properly spaced
  - [x] 9 hoshi (star) points at correct positions
  - [x] Grid uses `--board-grid` and `--board-hoshi` color tokens
- [x] **Coordinate labels** (`components/game/coordinate-labels.tsx`)
  - [x] Top: A–T (skipping I) in `font-mono`
  - [x] Left: 19–1 in `font-mono`
  - [x] Positioned outside the grid, muted color
  - [x] Labels inlined directly into `go-board.tsx` via inline-style grids (fragment bug fixed)
- [x] **Intersection component** (`components/game/intersection.tsx`)
  - [x] 19×19 CSS grid of clickable cells
  - [x] `h-full w-full` added so cells fill their grid slots correctly
  - [x] Hover state: ghost stone preview at low opacity
  - [x] Cursor: pointer on empty, default on occupied
- [x] **Stone component** (`components/game/stone.tsx`)
  - [x] Black stone: radial gradient with highlight, warm shadow
  - [x] White stone: radial gradient with highlight, subtle border, warm shadow
  - [x] Entry animation: scale-in with spring easing (300ms)
  - [x] Capture animation token already defined for later engine work
- [x] **Last move marker** (`components/game/last-move-marker.tsx`)
  - [x] Small accent-colored dot centered on the stone
- [x] **Static board test**
  - [x] Render a board with a handful of hardcoded stones to verify visuals
  - [x] Build verified clean after board component extraction

---

## Phase 4: Sidebar UI (Visual Only)

- [x] **Mode toggle** (`components/game/mode-toggle.tsx`)
  - [x] shadcn ToggleGroup in a pill container
  - [x] Options: Local, Versus AI (Online deferred)
  - [x] Active state: primary fill, inactive: transparent
- [x] **Player card** (`components/game/player-card.tsx`)
  - [x] shadcn Card with Avatar, name, stone-color badge, capture count badge, timer
  - [x] Active state: accent border, slight elevation, subtle lift
  - [x] Inactive state: muted opacity, flat
- [x] **Timer display** (`components/game/timer.tsx`)
  - [x] Static display in `font-mono`, tabular-nums
  - [x] Low-time warning style (red, pulse) — visual only for now
- [x] **Move history panel** (`components/game/move-history.tsx`)
  - [x] shadcn Card with ScrollArea
  - [x] Header: "History" label + move count badge
  - [x] Move items: number, stone color dot, player name, coordinate
  - [x] "Game started" placeholder item
  - [x] Pass moves styled differently (muted)
- [x] **Game controls** (`components/game/game-controls.tsx`)
  - [x] Pass button (secondary variant)
  - [x] Resign button (destructive variant)
  - [x] Both full-width in a flex row
- [x] **Game over dialog** (`components/game/game-over-dialog.tsx`)
  - [x] shadcn Dialog — result text, Play Again button (accent variant)
  - [x] Frosted overlay backdrop
- [x] **Assemble sidebar**
  - [x] Stack: mode toggle → player 1 card → player 2 card → move history → controls
  - [x] Verify spacing and scroll behavior when history grows
  - [x] Resign button opens Game Over dialog (visual demo)
- [x] **Mobile adaptation**
  - [x] Compact player bars for mobile
  - [x] Move history in a Drawer (slide-up)
  - [x] Test touch targets on all interactive elements (min 48px height on primary controls)

---

## Phase 5: Core Game Engine (TypeScript)

- [x] **Board data model** (`lib/engine/types.ts`)
  - [x] `Stone` type (0 = empty, 1 = black, 2 = white)
  - [x] `GameState` type (board, turn, moveNumber, captured, ko, history)
  - [x] `Move` type (x, y, player, pass flag)
  - [x] `Group` type (stones set, liberties count)
- [x] **Board utilities** (`lib/engine/board.ts`)
  - [x] `createEmptyBoard(size)` — returns flat or 2D array
  - [x] `getNeighbors(index, size)` — returns adjacent positions
  - [x] `boardToString(board)` / `stringToBoard(str)` — for hashing (ko detection)
- [x] **Group & liberty analysis** (`lib/engine/groups.ts`)
  - [x] `findGroup(board, position)` — flood-fill to find connected stones
  - [x] `countLiberties(board, group)` — count empty adjacent positions
  - [x] `getCapturedGroups(board, color)` — find all groups of `color` with 0 liberties
- [x] **Move validation** (`lib/engine/rules.ts`)
  - [x] `isValidMove(state, x, y)` — checks:
    - [x] Position is empty
    - [x] Not a suicide move (unless it captures)
    - [x] Not a ko violation (positional superko)
  - [x] `applyMove(state, x, y)` — returns new state after:
    - [x] Placing stone
    - [x] Removing captured opponent groups
    - [x] Updating capture count
    - [x] Updating ko position
    - [x] Advancing turn
  - [x] `applyPass(state)` — pass turn, track consecutive passes
- [x] **Game flow** (`lib/engine/game.ts`)
  - [x] `isGameOver(state)` — two consecutive passes
  - [x] `getValidMoves(state)` — all legal positions for current player
- [x] **Scoring** (`lib/engine/scoring.ts`)
  - [x] Territory counting (flood-fill empty regions, assign to surrounding color)
  - [x] Area scoring (Chinese rules) and territory scoring (Japanese rules)
  - [x] Komi application (6.5 default)
  - [x] Final score calculation
- [x] **SGF support** (`lib/engine/sgf.ts`)
  - [x] `gameToSGF(state, metadata)` — export game as SGF string
  - [x] `sgfToGame(sgfString)` — parse SGF into game state
- [x] **Engine tests**
  - [x] Unit tests for liberty counting, capture detection, ko rule, suicide rule
  - [x] Test scoring with known board positions
  - [x] Test SGF round-trip (export → import → compare)

---

## Phase 6: Wire UI to Engine (Playable Local Game)

- [~] **Game store** (`lib/stores/game-store.ts`)
  - [x] Zustand store wrapping the game engine
  - [x] State: gameState, moveHistory, timers, gameMode, isGameOver, winner
  - [x] Actions: placeStone, pass, resign, resetGame, setMode
  - [x] Derived: currentPlayer, validMoves, scores
- [~] **Connect board to store**
  - [x] Intersection click → `placeStone(x, y)` through store
  - [x] Board reads `gameState.board` from store
  - [x] Only show hover ghost on valid moves
  - [x] Stone entry animation triggers on new placements
  - [x] Capture animation triggers on removed stones
- [x] **Connect sidebar to store**
  - [x] Player cards read current turn, captures, timer
  - [x] Move history reads from store's move list
  - [x] Pass/Resign buttons dispatch store actions
  - [x] Mode toggle resets game and switches mode
- [x] **Timer logic** (`hooks/use-timer.ts`)
  - [x] Countdown hook — tracks time per player
  - [x] Pauses on non-active player
  - [x] Triggers game-over on timeout
  - [x] Low-time warning threshold (60s, 30s, 10s)
- [x] **Game over flow**
  - [x] Detect: two passes, resignation, timeout
  - [x] Calculate final score (on two passes)
  - [x] Show game-over dialog with result
  - [x] Play Again resets everything
- [x] **Keyboard navigation**
  - [x] Arrow keys to move intersection focus
  - [x] Enter/Space to place stone
  - [x] Focus ring visible on active intersection
- [ ] **Sound effects** (optional, low priority)
  - [ ] Stone placement click
  - [ ] Capture sound
  - [ ] Timer warning tick

---

## Phase 7: AI Opponent (Local)

- [x] **Random AI** (`lib/ai/random.ts`)
  - [x] Picks a random valid move from `getValidMoves()`
  - [x] Passes if no valid moves
  - [x] 300–600ms artificial delay for feel
- [x] **AI turn hook** (`hooks/use-ai-turn.ts`)
  - [x] Watches store — when it's AI's turn, triggers AI move after delay
  - [x] Shows "thinking" state on AI player card
- [x] **Wire to mode toggle**
  - [x] "Versus AI" mode: AI plays white
  - [x] "Local" mode: both players are human
- [x] **AI difficulty placeholder**
  - [x] UI selector (Easy / Medium / Hard)
  - [x] Easy = random, Medium/Hard = heuristic policy until KataGo integration

---

## Phase 8: Learning & Gamification UI

- [x] **AI tutor panel** (`components/learning/ai-chat-panel.tsx`)
  - [x] Chat-style message list with scroll
  - [x] Teal header with Sensei avatar and online indicator
  - [x] Quick tip chips: "Opening tips", "How to capture", "Territory"
  - [x] Static tips for now (hardcoded tip dictionary from go-3 inspo)
- [x] **XP bar** (`components/learning/xp-bar.tsx`)
  - [x] Streak counter with fire icon
  - [x] Progress bar (shadcn Progress, gradient fill)
  - [x] Increments on captures, game completions
- [x] **Tip triggers**
  - [x] Show opening tip on game start
  - [x] Show capture tip on first capture
  - [x] Show territory tip after move 50
  - [x] Show contextual AI move commentary (placeholder text)
- [x] **Sidebar integration**
  - [x] XP bar and AI tutor panel slot into sidebar below move history
  - [x] Collapsible on smaller screens
  - [x] Mobile: AI tutor becomes a FAB → Sheet

---

## Phase 9: Database & Auth

- [x] **Neon database setup**
  - [x] Provision Neon serverless PostgreSQL instance
  - [x] Configure connection string in `.env.local`
- [x] **Prisma schema** (`prisma/schema.prisma`)
  - [x] `User` — id, name, email, avatar, rating, createdAt
  - [x] `Game` — id, blackPlayerId, whitePlayerId, result, sgf, startedAt, endedAt
  - [x] `Move` — id, gameId, moveNumber, player, x, y, isPass, timestamp
  - [x] Relations: User ↔ Game (as black/white), Game ↔ Move
- [x] **Prisma client** (`lib/db.ts`)
  - [x] Singleton client instance
  - [x] Run initial migration
- [x] **Auth setup**
  - [x] Neon Auth integration
  - [x] Sign up / sign in flow
  - [x] Session management
  - [x] Protected routes (game pages require auth)
- [x] **User profile**
  - [x] Display name, avatar
  - [x] Game history list
  - [x] Win/loss record, rating
- [x] **Game persistence**
  - [x] Save completed games to database
  - [x] Save move list and SGF snapshot

---

## Phase 10: Multiplayer (Liveblocks)

- [ ] **Liveblocks setup**
  - [ ] Install `@liveblocks/client`, `@liveblocks/react`
  - [ ] Configure API keys in `.env.local`
  - [ ] Define room schema (board state, turn, timers, captures)
- [ ] **Room architecture**
  - [ ] Create room on game start
  - [ ] Join room via invite link or matchmaking
  - [ ] Room storage: full game state synced
  - [ ] Presence: show opponent's cursor/hover on board
- [ ] **Realtime game store** (`lib/stores/multiplayer-store.ts`)
  - [ ] Liveblocks storage replaces local Zustand for online games
  - [ ] Conflict resolution: server-authoritative turn order
  - [ ] Optimistic updates for stone placement
- [ ] **Presence indicators**
  - [ ] Opponent online/offline status
  - [ ] Opponent's hovered intersection (ghost stone in their color)
  - [ ] Connection quality indicator
- [ ] **Matchmaking** (basic)
  - [ ] Create game → get shareable link
  - [ ] Join game → enter room code or click link
  - [ ] Lobby UI: waiting for opponent screen
- [ ] **Online mode in UI**
  - [ ] Add "Online" option to mode toggle
  - [ ] Pre-game: show lobby/waiting state
  - [ ] In-game: sync all interactions through Liveblocks
  - [ ] Post-game: both players see result simultaneously

---

## Phase 11: AI Engine Integration (KataGo)

- [ ] **KataGo service**
  - [ ] Deploy KataGo on Fly.io or Cloudflare Worker
  - [ ] HTTP API: send board state, receive analysis (top moves, win rate, territory)
  - [ ] Rate limiting and request queuing
- [ ] **Analysis API route** (`app/api/analyze/route.ts`)
  - [ ] Accepts game state, returns KataGo analysis
  - [ ] Caches results for identical positions
- [ ] **AI opponent (Medium/Hard)**
  - [ ] Medium: KataGo with limited playouts (weaker)
  - [ ] Hard: KataGo with full playouts (strong)
  - [ ] Wire to existing AI turn hook
- [ ] **Move analysis overlay**
  - [ ] Show suggested moves as transparent colored stones on board
  - [ ] Win probability bar
  - [ ] Territory estimation heatmap
  - [ ] Toggle analysis on/off

---

## Phase 12: AI Tutor (OpenAI)

- [ ] **Tutor API route** (`app/api/tutor/route.ts`)
  - [ ] Accepts: current board state, last move, KataGo analysis, game context
  - [ ] Returns: natural language explanation of the position/move
  - [ ] System prompt tuned for Go teaching (beginner-friendly)
- [ ] **Tutor integration**
  - [ ] Replace static tips with live LLM responses
  - [ ] Trigger on: each player move, captures, mistakes (KataGo detects win% drop)
  - [ ] Streaming responses in the chat panel
- [ ] **Tutor modes**
  - [ ] Passive: tips appear in sidebar, non-intrusive
  - [ ] Active: ask Sensei a question (text input)
  - [ ] Review: post-game walkthrough, move-by-move commentary
- [ ] **Rate limiting**
  - [ ] Debounce requests (don't call on every single move)
  - [ ] Cache explanations for common positions/patterns
  - [ ] Token budget per game session

---

## Phase 13: Replay & Post-Game Review

- [ ] **Replay controls** (`components/game/replay-controls.tsx`)
  - [ ] Play/Pause, Step Forward, Step Back, Skip to Start/End
  - [ ] Timeline slider (scrub through moves)
  - [ ] Playback speed selector
- [ ] **Replay mode**
  - [ ] Load game from database or SGF
  - [ ] Board renders state at current replay position
  - [ ] Move history highlights current move
  - [ ] Side panel shows analysis at each position (if available)
- [ ] **Post-game review screen**
  - [ ] Score breakdown (territory, captures, komi)
  - [ ] Key moments timeline (big win% swings)
  - [ ] AI tutor commentary per move
  - [ ] Share / export SGF button
- [ ] **Game history page**
  - [ ] List of past games with opponent, result, date
  - [ ] Click to enter replay mode
  - [ ] Filter by result, opponent, date range

---

## Phase 14: Polish & Ship

- [ ] **Animations**
  - [ ] Board entrance animation (grid lines draw in on page load via GSAP)
  - [ ] Stone capture particles/effects
  - [ ] Score counting animation on game end
  - [ ] Page transitions
- [ ] **Dark mode**
  - [ ] Verify all tokens work in `.dark` theme
  - [ ] Theme toggle in settings
  - [ ] Persist preference
- [ ] **Performance**
  - [ ] Board rendering optimization (memo intersections, avoid full re-render)
  - [ ] Virtualize move history if it gets very long
  - [ ] Lazy load AI tutor panel, replay components
- [ ] **Accessibility audit**
  - [ ] Keyboard navigation complete flow test
  - [ ] Screen reader testing on board, moves, dialogs
  - [ ] `prefers-reduced-motion` support
  - [ ] Color contrast verification
- [ ] **SEO & meta**
  - [ ] Open Graph tags for shared game links
  - [ ] Favicon and app icons
- [ ] **Error handling**
  - [ ] Network disconnection recovery (multiplayer)
  - [ ] API failure fallbacks (AI tutor, KataGo)
  - [ ] Graceful error boundaries
- [ ] **Deploy**
  - [ ] Vercel deployment configuration
  - [ ] Environment variables for production
  - [ ] KataGo service deployment (Fly.io)
  - [ ] Domain setup
  - [ ] Monitoring and analytics

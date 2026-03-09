# Komi — Implementation Roadmap

Step-by-step build plan. UI first, then game logic, then integrations.

---

## Phase 1: Foundation & Design System Setup

- [ ] **Typography & fonts**
  - [ ] Replace Geist/Figtree with Bricolage Grotesque, DM Sans, JetBrains Mono in `layout.tsx`
  - [ ] Map font variables (`--font-display`, `--font-body`, `--font-mono`) in `globals.css`
  - [ ] Update `@theme inline` block with new font references
- [ ] **Color tokens**
  - [ ] Replace default shadcn neutral palette with Komi warm palette (`:root` and `.dark`) in `globals.css`
  - [ ] Add game-specific extended tokens (board, stones, status, tutor, xp)
- [ ] **Metadata**
  - [ ] Update `layout.tsx` metadata — title, description, favicon
- [ ] **Tailwind extensions**
  - [ ] Add `grid-cols-19` / `grid-rows-19` custom values
  - [ ] Add custom shadow tokens (shadow-board, shadow-offset)
  - [ ] Add stone-place / stone-capture keyframe animations
- [ ] **shadcn component theming**
  - [ ] Verify Button, Card, Badge, Dialog, Avatar, ScrollArea render correctly with new tokens
  - [ ] Add `accent` button variant
  - [ ] Ensure `rounded-2xl` / `rounded-3xl` defaults on Card, Dialog

---

## Phase 2: Layout Shell

- [ ] **Game layout component** (`components/layout/game-layout.tsx`)
  - [ ] Two-column flex layout (board area + sidebar)
  - [ ] Responsive breakpoints — side-by-side on desktop, stacked on mobile
  - [ ] Board area: flex-1, centered content
  - [ ] Sidebar: fixed width (380px desktop, 320px tablet, full-width mobile)
- [ ] **Page route** (`app/page.tsx`)
  - [ ] Replace boilerplate with `<GameLayout />` shell
  - [ ] Warm background (`bg-background`) with subtle texture/pattern
- [ ] **Background decoration**
  - [ ] Subtle decorative blobs or grain overlay (optional, low priority polish)

---

## Phase 3: Board UI (Visual Only)

- [ ] **Board container** (`components/game/go-board.tsx`)
  - [ ] Outer frame div — rounded-3xl, board-frame background, shadow-board
  - [ ] Inner surface div — rounded-2xl, board-surface background
  - [ ] Optional subtle wood grain texture via CSS or image
- [ ] **Grid layer** (SVG)
  - [ ] 19 vertical lines, 19 horizontal lines, properly spaced
  - [ ] 9 hoshi (star) points at correct positions
  - [ ] Grid uses `--board-grid` color token
- [ ] **Coordinate labels** (`components/game/coordinate-labels.tsx`)
  - [ ] Top: A–T (skipping I) in `font-mono`
  - [ ] Left: 19–1 in `font-mono`
  - [ ] Positioned outside the grid, muted color
- [ ] **Intersection component** (`components/game/intersection.tsx`)
  - [ ] 19x19 CSS grid of clickable cells
  - [ ] Hover state: ghost stone preview at 15% opacity
  - [ ] Cursor: pointer on empty, default on occupied
- [ ] **Stone component** (`components/game/stone.tsx`)
  - [ ] Black stone: radial gradient with highlight, warm shadow
  - [ ] White stone: radial gradient with highlight, subtle border, warm shadow
  - [ ] Entry animation: scale-in with spring easing (300ms)
  - [ ] Capture animation: scale-out with fade (250ms)
- [ ] **Last move marker** (`components/game/last-move-marker.tsx`)
  - [ ] Small accent-colored dot centered on the stone
- [ ] **Static board test**
  - [ ] Render a board with a handful of hardcoded stones to verify visuals
  - [ ] Test at all responsive breakpoints

---

## Phase 4: Sidebar UI (Visual Only)

- [ ] **Mode toggle** (`components/game/mode-toggle.tsx`)
  - [ ] shadcn ToggleGroup in a pill container
  - [ ] Options: Local, Versus AI (Online deferred)
  - [ ] Active state: primary fill, inactive: transparent
- [ ] **Player card** (`components/game/player-card.tsx`)
  - [ ] shadcn Card with Avatar, name, stone-color badge, capture count badge, timer
  - [ ] Active state: accent border, slight elevation, subtle lift
  - [ ] Inactive state: muted opacity, flat
- [ ] **Timer display** (`components/game/timer.tsx`)
  - [ ] Static display in `font-mono`, tabular-nums
  - [ ] Low-time warning style (red, pulse) — visual only for now
- [ ] **Move history panel** (`components/game/move-history.tsx`)
  - [ ] shadcn Card with ScrollArea
  - [ ] Header: "History" label + move count badge
  - [ ] Move items: number, stone color dot, player name, coordinate
  - [ ] "Game started" placeholder item
  - [ ] Pass moves styled differently (muted)
- [ ] **Game controls** (`components/game/game-controls.tsx`)
  - [ ] Pass button (secondary variant)
  - [ ] Resign button (destructive variant)
  - [ ] Both full-width in a flex row
- [ ] **Game over dialog** (`components/game/game-over-dialog.tsx`)
  - [ ] shadcn Dialog — result text, Play Again button (accent variant)
  - [ ] Frosted overlay backdrop
- [ ] **Assemble sidebar**
  - [ ] Stack: mode toggle → player 1 card → player 2 card → move history → controls
  - [ ] Verify spacing and scroll behavior when history grows
- [ ] **Mobile adaptation**
  - [ ] Compact player bars for mobile
  - [ ] Move history in a Drawer (slide-up)
  - [ ] Test touch targets on all interactive elements

---

## Phase 5: Core Game Engine (TypeScript)

- [ ] **Board data model** (`lib/engine/types.ts`)
  - [ ] `Stone` type (0 = empty, 1 = black, 2 = white)
  - [ ] `GameState` type (board, turn, moveNumber, captured, ko, history)
  - [ ] `Move` type (x, y, player, pass flag)
  - [ ] `Group` type (stones set, liberties count)
- [ ] **Board utilities** (`lib/engine/board.ts`)
  - [ ] `createEmptyBoard(size)` — returns flat or 2D array
  - [ ] `getNeighbors(index, size)` — returns adjacent positions
  - [ ] `boardToString(board)` / `stringToBoard(str)` — for hashing (ko detection)
- [ ] **Group & liberty analysis** (`lib/engine/groups.ts`)
  - [ ] `findGroup(board, position)` — flood-fill to find connected stones
  - [ ] `countLiberties(board, group)` — count empty adjacent positions
  - [ ] `getCapturedGroups(board, color)` — find all groups of `color` with 0 liberties
- [ ] **Move validation** (`lib/engine/rules.ts`)
  - [ ] `isValidMove(state, x, y)` — checks:
    - [ ] Position is empty
    - [ ] Not a suicide move (unless it captures)
    - [ ] Not a ko violation (positional superko)
  - [ ] `applyMove(state, x, y)` — returns new state after:
    - [ ] Placing stone
    - [ ] Removing captured opponent groups
    - [ ] Updating capture count
    - [ ] Updating ko position
    - [ ] Advancing turn
  - [ ] `applyPass(state)` — pass turn, track consecutive passes
- [ ] **Game flow** (`lib/engine/game.ts`)
  - [ ] `isGameOver(state)` — two consecutive passes
  - [ ] `getValidMoves(state)` — all legal positions for current player
- [ ] **Scoring** (`lib/engine/scoring.ts`)
  - [ ] Territory counting (flood-fill empty regions, assign to surrounding color)
  - [ ] Area scoring (Chinese rules) and territory scoring (Japanese rules)
  - [ ] Komi application (6.5 default)
  - [ ] Final score calculation
- [ ] **SGF support** (`lib/engine/sgf.ts`)
  - [ ] `gameToSGF(state, metadata)` — export game as SGF string
  - [ ] `sgfToGame(sgfString)` — parse SGF into game state
- [ ] **Engine tests**
  - [ ] Unit tests for liberty counting, capture detection, ko rule, suicide rule
  - [ ] Test scoring with known board positions
  - [ ] Test SGF round-trip (export → import → compare)

---

## Phase 6: Wire UI to Engine (Playable Local Game)

- [ ] **Game store** (`lib/stores/game-store.ts`)
  - [ ] Zustand store wrapping the game engine
  - [ ] State: gameState, moveHistory, timers, gameMode, isGameOver, winner
  - [ ] Actions: placeStone, pass, resign, resetGame, setMode
  - [ ] Derived: currentPlayer, validMoves, scores
- [ ] **Connect board to store**
  - [ ] Intersection click → `placeStone(x, y)` through store
  - [ ] Board reads `gameState.board` from store
  - [ ] Only show hover ghost on valid moves
  - [ ] Stone entry animation triggers on new placements
  - [ ] Capture animation triggers on removed stones
- [ ] **Connect sidebar to store**
  - [ ] Player cards read current turn, captures, timer
  - [ ] Move history reads from store's move list
  - [ ] Pass/Resign buttons dispatch store actions
  - [ ] Mode toggle resets game and switches mode
- [ ] **Timer logic** (`hooks/use-timer.ts`)
  - [ ] Countdown hook — tracks time per player
  - [ ] Pauses on non-active player
  - [ ] Triggers game-over on timeout
  - [ ] Low-time warning threshold (60s, 30s, 10s)
- [ ] **Game over flow**
  - [ ] Detect: two passes, resignation, timeout
  - [ ] Calculate final score (on two passes)
  - [ ] Show game-over dialog with result
  - [ ] Play Again resets everything
- [ ] **Keyboard navigation**
  - [ ] Arrow keys to move intersection focus
  - [ ] Enter/Space to place stone
  - [ ] Focus ring visible on active intersection
- [ ] **Sound effects** (optional, low priority)
  - [ ] Stone placement click
  - [ ] Capture sound
  - [ ] Timer warning tick

---

## Phase 7: AI Opponent (Local)

- [ ] **Random AI** (`lib/ai/random.ts`)
  - [ ] Picks a random valid move from `getValidMoves()`
  - [ ] Passes if no valid moves
  - [ ] 300–600ms artificial delay for feel
- [ ] **AI turn hook** (`hooks/use-ai-turn.ts`)
  - [ ] Watches store — when it's AI's turn, triggers AI move after delay
  - [ ] Shows "thinking" state on AI player card
- [ ] **Wire to mode toggle**
  - [ ] "Versus AI" mode: AI plays white
  - [ ] "Local" mode: both players are human
- [ ] **AI difficulty placeholder**
  - [ ] UI selector (Easy / Medium / Hard) — only Easy (random) works for now
  - [ ] Medium and Hard slots reserved for KataGo integration

---

## Phase 8: Learning & Gamification UI

- [ ] **AI tutor panel** (`components/learning/ai-chat-panel.tsx`)
  - [ ] Chat-style message list with scroll
  - [ ] Teal header with Sensei avatar and online indicator
  - [ ] Quick tip chips: "Opening tips", "How to capture", "Territory"
  - [ ] Static tips for now (hardcoded tip dictionary from go-3 inspo)
- [ ] **XP bar** (`components/learning/xp-bar.tsx`)
  - [ ] Streak counter with fire icon
  - [ ] Progress bar (shadcn Progress, gradient fill)
  - [ ] Increments on captures, game completions
- [ ] **Tip triggers**
  - [ ] Show opening tip on game start
  - [ ] Show capture tip on first capture
  - [ ] Show territory tip after move 50
  - [ ] Show contextual AI move commentary (placeholder text)
- [ ] **Sidebar integration**
  - [ ] XP bar and AI tutor panel slot into sidebar below move history
  - [ ] Collapsible on smaller screens
  - [ ] Mobile: AI tutor becomes a FAB → Sheet

---

## Phase 9: Database & Auth

- [ ] **Neon database setup**
  - [ ] Provision Neon serverless PostgreSQL instance
  - [ ] Configure connection string in `.env.local`
- [ ] **Prisma schema** (`prisma/schema.prisma`)
  - [ ] `User` — id, name, email, avatar, rating, createdAt
  - [ ] `Game` — id, blackPlayerId, whitePlayerId, result, sgf, startedAt, endedAt
  - [ ] `Move` — id, gameId, moveNumber, player, x, y, isPass, timestamp
  - [ ] Relations: User ↔ Game (as black/white), Game ↔ Move
- [ ] **Prisma client** (`lib/db.ts`)
  - [ ] Singleton client instance
  - [ ] Run initial migration
- [ ] **Auth setup**
  - [ ] Neon Auth integration
  - [ ] Sign up / sign in flow
  - [ ] Session management
  - [ ] Protected routes (game pages require auth)
- [ ] **User profile**
  - [ ] Display name, avatar
  - [ ] Game history list
  - [ ] Win/loss record, rating

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

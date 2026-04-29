# Missing, Broken, And Buggy Work

Static audit compiled from code review only. No build, test, or browser verification was run for this pass.

## P0: Security And Access Control

- [x] Protect Liveblocks auth so users cannot request full access to any room id from `app/api/liveblocks-auth/route.ts`.
- [x] Stop allowing anonymous/random guest ids in `app/api/liveblocks-auth/route.ts` unless guest multiplayer is an explicit product feature.
- [x] Validate Liveblocks room membership before issuing `session.FULL_ACCESS` in `app/api/liveblocks-auth/route.ts`.
- [x] Add route protection for `/games` and `/replay/:gameId` in `proxy.ts`, or make the route-level auth behavior explicit and consistent.
- [x] Add an auth check to `app/api/analyze/route.ts` if analysis should only be available to signed-in users.
- [x] Add auth and basic rate limiting to `app/api/tutor/route.ts`, especially if server-side AI keys are ever added.
- [x] Add payload size limits or strict validation for analysis and tutor API board payloads.

## P0: Multiplayer Correctness

- [x] Enforce online turn ownership before allowing a user to play in `components/pages/home-page-client.tsx`; currently a connected user can likely play whichever color is active.
- [x] Enforce online pass and resign ownership so only the current assigned player can pass or resign.
- [x] Persist online games once, not once per participant, when a Liveblocks game ends.
- [x] Implement online timer sync; `useGameClock(mode !== "online")` disables local timers but no Liveblocks timer loop replaces it.
- [x] Store and sync board size, komi, and timer settings in Liveblocks storage so all clients score and render the same game.
- [x] Add a clear leave-room/reset-room path for online games.
- [x] Make room creation/joining verify ownership or invitation intent instead of blindly reusing room ids.
- [x] Replace the `as any` Liveblocks server calls in `lib/liveblocks/server.ts` and `app/api/liveblocks/rooms/route.ts` with typed SDK calls.

## P1: Game Data And Persistence

- [x] Add `mode`, `boardSize`, `komi`, `ruleset`, `resultReason`, and stronger participant metadata to the Prisma `Game` model.
- [x] Store an external auth/provider id on `User`; `lib/auth/session.ts` currently upserts by email only.
- [x] Fix self-play stats: local games can save the same user as both black and white, making win/loss calculations unreliable.
- [x] Save enough move metadata to replay a game without depending on SGF parsing.
- [x] Add indexes needed for game history queries, especially by player/date/result.
- [x] Decide whether local casual games should be persisted at all, or whether only ranked/online games should affect profile stats.
- [x] Add a migration plan for saved games before changing the Prisma schema.
- [ ] Stop the dev server and rerun `pnpm exec prisma generate` if Windows is locking Prisma's query engine DLL.

## P1: Game Engine And Rules

- [x] Make scoring limitations explicit in UI; `lib/engine/scoring.ts` is an approximate territory estimator and can be wrong for dead stones, seki, and neutral points.
- [x] Add a dead-stone marking or review phase before final scoring.
- [x] Fix black-only player identity assumptions in `lib/stores/game-store.ts`; black is treated as "the player" across XP, tutor insights, win/loss reactions, and pass scoring.
- [x] Avoid generating player feedback for AI/opponent moves unless the UX intentionally frames it that way.
- [x] Handle AI illegal or stale moves in `hooks/use-ai-turn.ts` by retrying, passing, or surfacing an error.
- [x] Improve timer accuracy in `hooks/use-timer.ts`; interval ticks can drift badly in inactive tabs.
- [x] Review `resign()` state semantics in `lib/stores/game-store.ts`; it sets `currentPlayer` to the winner, which is surprising.
- [x] Append or intentionally ignore board history on pass in `lib/engine/rules.ts`; the current behavior should be documented.
- [x] Tighten SGF parsing in `lib/engine/sgf.ts` for escaped values, invalid board sizes, and non-linear variations.
- [x] Fix `gameToSGF` so `komi: 0` is preserved instead of falling back to `6.5`.

## P1: Board UI And Interaction

- [x] Verify and fix stone/grid alignment in `components/game/go-board.tsx`; grid lines use `size - 1` spacing while stones are placed in `size` CSS grid cells.
- [x] Align hoshi points with the same coordinate system as stones and grid intersections.
- [x] Ensure hit targets match visual intersections on all board sizes.
- [x] Add responsive collision handling between the board, dock, and right-side panels in `components/layout/game-layout.tsx`.
- [x] Add a mobile-specific dock/panel behavior; `min(620px, calc(100vw - 2rem))` can cover most of the game on small screens.
- [x] Fix `GameOverDialog` close behavior in `components/pages/home-page-client.tsx`; `onOpenChange={() => {}}` makes the close affordance non-functional.
- [x] Add richer game-over actions: review, save status, replay, rematch, and share.

## P1: Tutor, Sensei, And AI UX

- [ ] Verify the default OpenAI model in `app/api/tutor/route.ts` before relying on it.
- [ ] Make it clear in UI that BYO OpenAI keys are sent through the app server, not used purely client-side.
- [x] Add request cancellation and error recovery for streaming tutor responses in `components/learning/ai-chat-panel.tsx`.
- [ ] Prevent tutor spam by tying coaching triggers to meaningful game events rather than global module counters.
- [ ] Move tutor rate state out of module-level globals in `lib/stores/game-store.ts`.
- [ ] Separate beginner coaching, move review, and chat modes so Sensei does not feel random or repetitive.
- [x] Add a deterministic fallback message when the tutor API fails.
- [x] Clean up stale animation/comment code in `components/learning/ai-reaction.tsx`.

## P1: UI Consistency And Visual Drift

- [ ] Decide the final aesthetic direction between the new Swiss/brutalist style and the older warm rounded account/profile style.
- [ ] Restyle `app/profile/page.tsx` to match the same visual language as the current gameplay and settings work.
- [ ] Restyle `components/pages/game-history-page-client.tsx` to match the new aesthetic.
- [ ] Restyle `app/account/[path]/page.tsx` or intentionally keep it as a separate auth-provider surface.
- [ ] Replace leftover rounded premium card patterns with the new dock/page grammar where appropriate.
- [ ] Remove or consolidate old `.account-*` scoped styles in `app/globals.css` if they are no longer part of the direction.
- [ ] Fix the theme system: `components/providers.tsx` forces light mode while the app still has dark tokens and theme-toggle remnants.
- [x] Remove unused `ThemeToggle` imports from `components/layout/game-layout.tsx`, or restore a working theme switcher.
- [ ] Replace mixed icon systems with one intentional set; docs mention Hugeicons, but components still use `react-icons` and `lucide-react`.
- [ ] Audit all verbose empty states so they fit compact cards and dock panes without awkward wrapping.
- [ ] Rework dock-expanded panes so they feel connected to the dock and do not cover important board context unexpectedly.

## P2: Page And Routing Gaps

- [ ] Decide whether `app/landing/page.tsx` should be the unauthenticated home; currently `/` is protected and redirects to sign-in.
- [ ] Add an intentional onboarding path after first sign-in instead of dropping every user directly into the board.
- [ ] Make replay pages resilient to missing, private, or malformed games.
- [ ] Add loading and empty states for game history/profile routes that match the new design system.
- [ ] Add a proper 404 or not-found treatment for invalid game and replay ids.

## P2: Code Organization

- [ ] Split `components/pages/home-page-client.tsx`; it currently mixes app shell, online gameplay, panel rendering, persistence, dialogs, and layout logic.
- [ ] Extract online room logic into a dedicated hook or feature module.
- [ ] Extract game persistence into a dedicated hook/service.
- [ ] Extract dock panel content into smaller, independently testable components.
- [ ] Remove unused imports across UI files, especially after the recent icon and panel iterations.
- [ ] Replace broad `any` usage in multiplayer and Liveblocks code.
- [ ] Add explicit types for API request and response payloads.
- [ ] Centralize supported board sizes instead of repeating `9 | 13 | 19` assumptions.

## P2: Docs And Configuration

- [ ] Update `README.md`; it references TanStack Query, KataGo, Fly.io, Cloudflare KV, and other systems that are not current.
- [ ] Update `project-todo.md` so skipped KataGo work and the cheap BYO AI-key direction are accurately reflected.
- [ ] Add `NEXT_PUBLIC_NEON_AUTH_BASE_URL` to `.env.example` or remove the fallback reference from `lib/auth/server.ts`.
- [ ] Document Liveblocks setup clearly, including where to get `LIVEBLOCKS_SECRET_KEY`.
- [ ] Document the BYO AI key flow and privacy implications.
- [ ] Document current scoring limitations so future UI copy does not overpromise.
- [ ] Document the intended route protection model for public, auth, account, game, and API routes.

## P3: Polish And Quality Of Life

- [ ] Improve post-game review copy and layout so resign, timeout, pass-pass, and score wins all feel distinct.
- [ ] Add compact replay controls for mobile.
- [ ] Add better online presence labels than raw connection-based player assignment.
- [ ] Add copy-to-clipboard feedback for room share links.
- [ ] Add save-state feedback when a game has been persisted.
- [ ] Add graceful fallback UI when Liveblocks env vars are missing instead of only throwing from server code.
- [ ] Add a visual audit pass for spacing, z-index, shadows, and panel padding after the UI V2 direction is chosen.
- [ ] Add accessibility labels for dock buttons, board intersections, panel toggles, and destructive actions.
- [ ] Add keyboard support for dock navigation and modal/panel close actions.
- [ ] Add reduced-motion handling for GSAP/motion animations.

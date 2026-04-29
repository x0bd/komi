# Missing / Broken / Buggy Audit

Static code-read audit only. No build, tests, lint, or dev server were run.

Use this as the repair map before continuing feature work.

## P0 - Likely Broken Or Security-Critical

- [ ] Protect `/games` and `/replay/:gameId` in `proxy.ts`. These pages call authenticated APIs and replay private games, but the middleware only protects `/`, `/account/:path*`, and `/profile/:path*`.
- [ ] Lock down `/api/liveblocks-auth/route.ts`. It currently falls back to a random guest id and grants `FULL_ACCESS` to any requested room, which means anyone who knows a room id can request full room access.
- [ ] Fix Liveblocks room creation in `app/api/liveblocks/rooms/route.ts`. Room creation swallows every error and still returns a room id, so missing permissions, invalid secret, network failure, or API changes can look like success.
- [ ] Remove `(liveblocks as any)` usage in Liveblocks APIs and align with the installed Liveblocks server API. The current code hides type/API mismatches in `createRoom`, `getRoom`, `prepareSession`, and session access constants.
- [ ] Verify the tutor OpenAI model in `app/api/tutor/route.ts`. `OPENAI_MODEL = "gpt-4.1-mini"` is likely stale or unavailable depending on current OpenAI account/model access; make this env-driven with a safe fallback.
- [ ] Stop passing user OpenAI API keys through app server logs/request bodies without a clear privacy boundary. `components/learning/ai-chat-panel.tsx` stores the key in `localStorage` and sends it to `/api/tutor`; document this clearly or move to a safer BYOK flow.
- [ ] Fix `app/page.tsx` forcing auth before users can see the product. There is a polished `app/landing/page.tsx`, but unauthenticated `/` users are redirected to sign-in instead of landing.
- [ ] Add auth/session handling around game save failures in `components/pages/home-page-client.tsx`. Failed `/api/games` persistence is swallowed except for resetting a ref, so users can finish games and silently lose history.

## P1 - Gameplay / Data Correctness

- [ ] Store board size and komi directly in Prisma. `Game` only stores moves/result/SGF, and `/api/games/[gameId]/route.ts` infers board size from SGF or defaults to 19. If SGF is missing or invalid, 9x9/13x13 replays will load as 19x19.
- [ ] Add `mode`, `komi`, `size`, and `ruleset` fields to `Game`. Current game history cannot reliably distinguish local self-play, versus AI, online, board size, scoring mode, or komi after save.
- [ ] Fix online timer behavior. `useGameClock(mode !== "online")` disables local clock ticks in online mode, but Liveblocks storage timers are not being decremented anywhere, so online timers appear static.
- [ ] Enforce assigned colors in online play. `OnlineGameplayLayout` allows any connected user to commit the current turn if `waitingForOpponent` is false; it does not block a white player from playing black's move or vice versa.
- [ ] Decide what happens with spectators in online rooms. Color assignment only slices the first two connection ids, but extra users still get full room write access and can call mutations.
- [ ] Add online pass/resign persistence and review parity. Online pass/resign updates Liveblocks storage, but saved game persistence and post-game review depend on local store sync and may not capture clean metadata.
- [ ] Review positional superko versus simple ko behavior in `lib/engine/rules.ts`. `ko` is computed but validation only checks full board history; either remove `ko` or wire it intentionally so rules/UI agree.
- [ ] Fix SGF parser limitations in `lib/engine/sgf.ts`. The parser ignores setup properties, variations, comments, handicap stones, escaped `]` in more complex cases, and player-to-move mismatch; imported SGFs can fail or replay incorrectly.
- [ ] Add validation for move coordinates in `/api/games/route.ts`. `coerceMoves` accepts any numeric x/y for non-pass moves, so invalid coordinates can be persisted.
- [ ] Avoid self-play history ambiguity. Local games save the same user as black and white; profile/history then display "Self play" but cannot represent actual second player names or local guest players.
- [ ] Rework Japanese scoring assumptions in `lib/engine/scoring.ts`. Current territory detection is a rough flood-fill with no dead-stone marking, seki handling, dame handling, or scoring confirmation UI.

## P1 - Type / Runtime Risk

- [ ] Remove `as any` in `components/pages/home-page-client.tsx` around replay scoring. It masks the board type mismatch between `number[]` and `BoardState`.
- [ ] Replace `storage: { set: (..., value: any) => void }` in `components/pages/home-page-client.tsx` with proper Liveblocks storage types.
- [ ] Audit dynamic route param types. Pages like `app/account/[path]/page.tsx`, `app/auth/[path]/page.tsx`, and API route contexts use Promise-shaped params; keep this only if it matches the installed Next.js route type output.
- [ ] Add error UI for missing Liveblocks config in the online panel. The API returns 503, but the UX just surfaces generic room errors inside the panel.
- [ ] Add error boundaries or fallback states around `AuthView` and `AccountView`. Neon Auth config/package issues currently surface as route-level crashes.
- [ ] Fix strict model/provider drift in docs and code. README claims KataGo + OpenAI, but implementation uses `simpleEngine` and optional BYOK OpenAI only.

## P1 - UI / UX Breakage And Drift

- [ ] Reconcile the current Swiss/brutalist theme with `uiv2.md`. The app is mid-transition: board, dock, auth, landing, chat, and review use hard square Swiss styling while history/profile/settings still carry older softer surfaces.
- [ ] Fix theme toggle behavior. `components/providers.tsx` sets `forcedTheme="light"`, so any visible `ThemeToggle` cannot actually switch themes.
- [ ] Decide whether dark mode is supported. `app/globals.css` has dark tokens, but the provider forces light and many new Swiss components hard-code black/white classes.
- [ ] Remove or restyle the right floating score dashboard in `GameLayout`. It is visually heavy, may collide with the board on smaller screens, and is absent in online mode because `rightPanel` is not passed there.
- [ ] Fix mobile responsiveness of the dock and board. `GameLayout` uses a fixed left dock and large expanded width; on small screens the expanded panel can consume almost the whole viewport while the board remains behind it.
- [ ] Rework `AIChatPanel` layout. It uses fixed-ish minimum heights, heavy nested panels, and lots of uppercase copy; likely cramped inside the expanding dock and difficult on mobile.
- [ ] Rework `AIReaction` placement and stacking. It sits bottom-right and may overlap the right score dashboard, chat toggle, or mobile controls.
- [ ] Fix `GameOverDialog` closing behavior. The dialog receives `onOpenChange={() => {}}`, so the close button does not actually close it.
- [ ] Add a clear saved-game/replay link after game over. Users can finish a game, but there is no visible confirmation that it saved or direct CTA to replay/history.
- [ ] Refresh `/games` and `/profile` after the V2 direction is decided. They still use the earlier soft-card design and will clash with the current Swiss game shell.
- [ ] Restyle `/account/[path]` again after V2. It was polished for the previous aesthetic and now sits between two visual systems.
- [ ] Make `app/landing/page.tsx` responsive beyond desktop. It uses `h-screen/w-screen/overflow-hidden` and very large fixed-ish heading sizes; mobile content can be clipped.
- [ ] Replace README/design claims that no longer match the app. README says Hugeicons, TanStack Query, KataGo, warm wabi-sabi, and Fly/Cloudflare game services, but the code currently uses react-icons, no TanStack Query, simple engine, Swiss theme, and Liveblocks.

## P2 - Product Gaps / Missing Features

- [ ] Add a settings surface for board size and komi. The engine supports 9/13/19 and variable komi, but the live UI does not expose them clearly.
- [ ] Add a real player identity model for local games. Player 1/Player 2 labels are hard-coded, and local game persistence cannot represent a second human.
- [ ] Add AI provider/key settings outside the chat panel. BYOK is hidden inside Sensei chat and not part of account/settings.
- [ ] Add clear online room lifecycle controls: leave room, copy room id, reset room, rematch, and host controls.
- [ ] Add proper spectator/read-only behavior for online rooms.
- [ ] Add loading and empty states for replay analysis/tutor that match the final V2 aesthetic.
- [ ] Add user-facing error states for `/api/analyze`, `/api/tutor`, `/api/games`, and Liveblocks failures.
- [ ] Add replay import as a first-class route or modal instead of hiding SGF paste inside replay dock settings.
- [ ] Add persistent game review data if post-game notes/key moments should survive reloads. Right now most review content is derived client-side or fetched per replay session.
- [ ] Add account/profile fields for display name/avatar editing beyond whatever Neon Auth exposes by default.
- [ ] Add rating update logic. `User.rating` exists and profile displays it, but games do not update ratings.

## P2 - Architecture / Maintainability

- [ ] Split `components/pages/home-page-client.tsx`. It currently owns app shell orchestration, online room shell, online mutations, local board replay, sidebar panel construction, key moments, result formatting, and multiplayer snapshot helpers.
- [ ] Move duplicated replay/key-moment helpers into shared modules. Similar logic appears in home replay and replay page.
- [ ] Extract game persistence into a dedicated client action/helper so save errors, retries, and result formatting are centralized.
- [ ] Extract session-to-DB-user upsert. Similar code exists in `lib/auth/session.ts`, `/api/games/route.ts`, and `/api/games/[gameId]/route.ts`.
- [ ] Add route-level API schemas or validators. Current request parsing is manual and inconsistent across APIs.
- [ ] Add a typed Liveblocks abstraction for room creation/auth instead of direct `any` calls in API routes.
- [ ] Revisit global module state in `lib/stores/game-store.ts`. `captureClearTimeout`, tutor request counters, and provider state live outside Zustand and can behave awkwardly across HMR or multiple mounted instances.
- [ ] Move tutor message generation rules out of `app/api/tutor/route.ts` once they grow further.
- [ ] Decide whether `react-icons`, `lucide-react`, and Hugeicons should all stay. The dependency/icon story is currently mixed.
- [ ] Remove stale or contradictory docs: `README.md`, `design-sys.md`, `ui-restyle.md`, `uiv2.md`, and `project-todo.md` should be reconciled once the V2 direction is chosen.

## P2 - Testing / Verification Gaps

- [ ] Add engine tests for suicide, ko/superko, pass end, captures, SGF round-trip, and invalid SGF imports beyond the current test coverage.
- [ ] Add API tests for game save/list/detail authorization, invalid move payloads, and board-size persistence.
- [ ] Add Liveblocks API tests or mocks for create/join/auth failure cases.
- [ ] Add UI smoke coverage for landing, auth, home gameplay, online room panel, history, profile, settings, and replay.
- [ ] Add mobile viewport checks for the board+dock layout, chat panel, game-over dialog, landing page, and auth page.
- [ ] Add accessibility checks for board keyboard navigation, dialog focus behavior, dock buttons/tooltips, and form labels.

## Suggested Fix Order

- [ ] Step 1: Fix route protection and Liveblocks auth/security.
- [ ] Step 2: Fix game persistence schema gaps: size, komi, mode, ruleset.
- [ ] Step 3: Fix online gameplay correctness: timers, color enforcement, spectators, leave/rematch.
- [ ] Step 4: Fix tutor/OpenAI configuration and BYOK privacy messaging.
- [ ] Step 5: Split `home-page-client.tsx` into smaller modules before deeper UI work.
- [ ] Step 6: Reconcile V2 visual system and update core primitives/layout.
- [ ] Step 7: Polish replay/history/profile/account/auth after the V2 foundation is stable.
- [ ] Step 8: Add focused tests after the high-risk fixes land.

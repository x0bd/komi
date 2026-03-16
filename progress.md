Original prompt: lets continue building

- 2026-03-17: Continuing after Phase 5 engine work. Current focus is Phase 6 board wiring.
- Goal for this pass: expose derived move state from the store, restrict hover/click to legal intersections, and add keyboard navigation to the board.
- Constraint from user: do not run tests/build/lint unless explicitly requested or an on-screen issue is reported.
- Completed in this pass:
  - Added `currentPlayer` and `validMoves` as derived store state.
  - Wired `GoBoard` to consume legal moves from the store.
  - Legal-move hover now only appears on playable intersections.
  - Illegal clicks are ignored at the board edge instead of surfacing ghost stones.
  - Added arrow-key navigation, Enter/Space placement, and a visible focus ring on intersections.
- Additional pass:
  - Moved match timers into the game store.
  - Added a single game clock hook in `hooks/use-timer.ts` instead of separate local card timers.
  - Sidebar timers now render from store state.
  - Timeout now ends the game and surfaces a timeout-specific game-over reason.
  - Tightened store subscriptions in `page.tsx` and `use-ai-turn.ts` to avoid dragging the whole UI on every timer tick.
  - Added transient capture animation state in the store and a board overlay so captured stones animate out instead of disappearing instantly.
- Remaining high-value Phase 6 work:
  - Optionally expose live score preview from the store if we want the sidebar to show score context before game end.

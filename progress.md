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
- Remaining high-value Phase 6 work:
  - Move timer state into the game store and handle timeout game-over.
  - Add capture removal animation instead of stones disappearing instantly.
  - Optionally expose live score preview from the store if we want the sidebar to show score context before game end.

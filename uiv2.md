# UI V2 Checklist

This is the full UI surface audit for the current app, ordered in the sequence that makes the most sense for a full aesthetic refresh.

The goal of this list is not just to restyle isolated screens, but to move the whole product onto one coherent V2 visual system.

## 1. Design Foundation First

- [ ] Rework the global design foundation in `app/globals.css` so V2 has a new token set for background, cards, borders, shadows, overlay treatments, motion, and accent colors.
- [ ] Review the app-level shell in `app/layout.tsx` to make sure page spacing, fonts, body framing, and top-level chrome match the new aesthetic.
- [ ] Audit cross-app provider styling hooks in `components/providers.tsx` so theme, toast, tooltip, and modal behavior feel native to the new system.
- [ ] Revisit the reusable primitive layer used everywhere: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/badge.tsx`, `components/ui/avatar.tsx`, `components/ui/dialog.tsx`, `components/ui/tooltip.tsx`, `components/ui/tabs.tsx`, `components/ui/switch.tsx`, `components/ui/select.tsx`, `components/ui/slider.tsx`, `components/ui/separator.tsx`, `components/ui/empty.tsx`.
- [ ] Restyle `components/ui/theme-toggle.tsx` so theme switching visually belongs to V2 and stops feeling like a separate utility control.

## 2. Main Gameplay Shell

- [ ] Redesign the primary game route entry in `app/page.tsx` only if the page-level framing needs to change after the new shell is decided.
- [ ] Rework the main gameplay composition in `components/pages/home-page-client.tsx`; this is the highest-impact V2 surface because it defines the core play experience.
- [ ] Rebuild the dock architecture in `components/layout/game-layout.tsx` so rail, expanding panes, spacing, overlays, and header controls all follow the new V2 language.

## 3. Board Presentation Layer

- [ ] Rework the board container and board framing in `components/game/go-board.tsx`.
- [ ] Refresh board intersections and click/hover affordances in `components/game/intersection.tsx`.
- [ ] Redesign stones and their finish, depth, highlight, and scale feel in `components/game/stone.tsx`.
- [ ] Revisit last-move emphasis in `components/game/last-move-marker.tsx`.
- [ ] Revisit coordinate styling and tone in `components/game/coordinate-labels.tsx`.

## 4. Core Live Game Panels

- [ ] Rework both player identity cards in `components/game/player-card.tsx`.
- [ ] Redesign live game controls in `components/game/game-controls.tsx`.
- [ ] Refresh the live scoring/status surface in `components/game/live-score-card.tsx`.
- [ ] Redesign mode switching in `components/game/mode-toggle.tsx`.
- [ ] Restyle AI difficulty controls in `components/game/ai-difficulty-selector.tsx`.
- [ ] Rework move history structure and hierarchy in `components/game/move-history-section.tsx`.
- [ ] Audit `components/game/move-history.tsx` and decide whether it stays, gets merged into `move-history-section`, or becomes a V2 sub-piece.
- [ ] Revisit time display polish in `components/game/timer.tsx`.

## 5. Multiplayer-Specific UI

- [ ] Redesign online room creation/join UI in `components/game/online-room-panel.tsx`.
- [ ] Review multiplayer syncing/presence presentation in `components/game/online-room-sync.tsx`.

## 6. Sensei / Learning Layer

- [ ] Rebuild the tutor/chat surface in `components/learning/ai-chat-panel.tsx` so it feels tightly integrated with the gameplay shell.
- [ ] Revisit the ambient coach popup in `components/learning/ai-reaction.tsx` now that the broader V2 direction is changing.
- [ ] Redesign the mobile trigger/control in `components/learning/mobile-sensei-fab.tsx`.
- [ ] Rework progression/streak gamification UI in `components/learning/xp-bar.tsx`.

## 7. End-of-Game and Review Surfaces

- [ ] Restyle the game over experience in `components/game/game-over-dialog.tsx`.
- [ ] Rework the post-game analysis surface in `components/game/post-game-review-card.tsx`.
- [ ] Redesign replay transport controls in `components/game/replay-controls.tsx`.

## 8. Replay Experience

- [ ] Rework the replay route framing in `app/replay/[gameId]/page.tsx` if the page shell needs V2-specific structure.
- [ ] Redesign the replay experience end-to-end in `components/pages/replay-page-client.tsx`; this includes board framing, dock content hierarchy, analysis cards, tutor notes, and SGF loading UI.

## 9. History / Archive Experience

- [ ] Review route-level framing in `app/games/page.tsx`.
- [ ] Refine the archive page in `components/pages/game-history-page-client.tsx`; this page is already one of the strongest visual references, but still needs to be pushed into the new V2 language once the foundation changes.

## 10. Profile Experience

- [ ] Rework the profile page in `app/profile/page.tsx`; it is another strong current reference, but it should be updated after the new token system and card language are locked.

## 11. Account / Settings Experience

- [ ] Revisit the account/settings shell in `app/account/[path]/page.tsx` after the V2 foundation is finalized, so the recent polish is translated into the new aesthetic instead of the current one.
- [ ] Audit the route redirect entry in `app/account/page.tsx` only if navigation or page transitions become part of the V2 refresh.

## 12. Auth Experience

- [ ] Rebuild the auth shell in `app/auth/[path]/page.tsx` so sign-in and sign-up feel like the same product as gameplay, history, profile, and settings.
- [ ] Audit the route entry in `app/auth/page.tsx` if any auth landing or redirect experience becomes visually relevant.

## 13. Final Consistency Pass

- [ ] Audit icon usage across all surfaced UI files and replace any mismatched iconography with a tighter V2 icon language.
- [ ] Audit motion across dock transitions, hover states, dialogs, popups, board interactions, and page entries so animations feel intentional rather than component-by-component.
- [ ] Audit empty states, error states, loading states, and skeletons across `components/pages/home-page-client.tsx`, `components/pages/replay-page-client.tsx`, `components/pages/game-history-page-client.tsx`, `app/profile/page.tsx`, `app/account/[path]/page.tsx`, and `app/auth/[path]/page.tsx`.
- [ ] Audit responsive behavior across board view, dock expansion, replay panels, history filters, account screens, and profile cards.
- [ ] Do a final primitive sweep for any remaining mismatches in `components/ui/*` after the page-level work is complete.

## Suggested Execution Order

- [ ] Step 1: `app/globals.css`
- [ ] Step 2: `components/ui/*` foundation primitives
- [ ] Step 3: `components/layout/game-layout.tsx`
- [ ] Step 4: `components/pages/home-page-client.tsx`
- [ ] Step 5: `components/game/go-board.tsx` + board presentation components
- [ ] Step 6: live game cards, controls, move history, and timers in `components/game/*`
- [ ] Step 7: `components/learning/*`
- [ ] Step 8: `components/game/game-over-dialog.tsx` + `components/game/post-game-review-card.tsx` + `components/game/replay-controls.tsx`
- [ ] Step 9: `components/pages/replay-page-client.tsx`
- [ ] Step 10: `components/pages/game-history-page-client.tsx`
- [ ] Step 11: `app/profile/page.tsx`
- [ ] Step 12: `app/account/[path]/page.tsx`
- [ ] Step 13: `app/auth/[path]/page.tsx`
- [ ] Step 14: final consistency and responsive polish pass

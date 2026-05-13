# Kanji UI Direction

This is the implementation guide for the Komi UI reset. The target is a fixed, single-theme interface inspired by the attached pale editorial Japan layout and fused with the local `nothing-design` skill: exposed structure, precise lines, technical typography, restrained color, and one sharp expressive accent at a time.

No theme switching. No dark mode. No gradients in UI chrome. No soft “premium card” shadows. The grid, the lines, and the type are the design.

## 0. Required Fonts

Use exactly two font families:

- `Geist` for primary UI, headings, labels, and readable interface copy.
- `JetBrains Mono` for timers, coordinates, metadata, move notation, room IDs, and system labels.

Load through `next/font/google` in [app/layout.tsx](C:\Users\HP\dev\experiments\komi\app\layout.tsx):

```tsx
import { Geist, JetBrains_Mono } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})
```

Apply to `<body>`:

```tsx
<body className={`${geist.variable} ${mono.variable}`}>
```

Map in [app/globals.css](C:\Users\HP\dev\experiments\komi\app\globals.css):

```css
@theme inline {
  --font-sans: var(--font-geist);
  --font-display: var(--font-geist);
  --font-mono: var(--font-mono);
}
```

## 1. Core Aesthetic

Name: `Kanji Grid / Nothing Kyoto`.

Design sentence:

Komi should feel like a technical exhibition poster for a Go match: pale blue-gray paper, thin architectural lines, sparse controls, large ghost kanji, red sun accents, tiny mono metadata, and one precise board as the main instrument.

Influences:

- Attached reference: pale desaturated background, bordered modular layout, vertical side text, oversized translucent kanji, red sun event, small black labels, restrained purple-blue action accent.
- Nothing design: monochrome discipline, visible structure, minimal ornament, technical controls, no unnecessary shadows, percussive motion.
- Go/Japanese editorial layer: kanji used as atmosphere and wayfinding, not decoration spam.

## 2. Fixed Theme Tokens

Use one fixed light theme. Remove theme switching from the final UI pass.

```css
:root {
  --background: #d8deeb;
  --foreground: #2d3542;
  --card: #d8deeb;
  --card-foreground: #2d3542;

  --muted: #cfd6e3;
  --muted-foreground: #6f7888;
  --subtle: #e2e7f1;

  --border: #bac3d1;
  --border-strong: #9fa9ba;
  --hairline: rgb(45 53 66 / 18%);

  --accent: #f24f5f;
  --accent-foreground: #11151c;
  --signal: #4037d2;
  --signal-foreground: #f4f6fb;

  --success: #4f8f72;
  --warning: #b98635;
  --danger: #d84a57;

  --board-surface: #c9bca7;
  --board-grid: #807668;
  --stone-black: #161a20;
  --stone-white: #f2f1ea;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

Token rules:

- Background and cards are nearly the same color. Separation comes from lines and spacing, not surface contrast.
- Red is the “sun / alert / decisive event” color. Use it sparingly.
- Blue-violet is the “action / play / online / selected” signal. Use less often than red.
- Borders are usually 1px. Use 2px only for board frame, current-player state, destructive confirmation, or active dock panel.
- No shadows by default. If a component absolutely needs elevation, use a 1px offset line or a darker bottom border.

## 3. Typography Rules

Use only three type roles per screen:

- Primary: Geist, 28-56px, weight 600-700, tight tracking. Used for page titles, player names, result states.
- Secondary: Geist, 13-16px, weight 500-600. Used for content and panel copy.
- Tertiary: JetBrains Mono, 10-12px, uppercase, tracking `0.12em-0.2em`. Used for metadata, coordinates, dates, state labels.

Hard rules:

- Timers are always JetBrains Mono.
- Coordinates are always JetBrains Mono.
- Buttons are Geist unless they represent a system/meta action, then JetBrains Mono.
- Do not use more than two weights in a component.
- Avoid `font-black` as the default. The new aesthetic is precise, not shouty.

## 4. Kanji Usage

Kanji should feel like architectural signage.

Approved kanji:

- `碁` Go / game
- `対局` match
- `先生` Sensei
- `記録` record / history
- `形` shape
- `勝` win
- `敗` loss
- `白` white
- `黒` black
- `日本` Japan / visual motif only

Usage rules:

- Large ghost kanji: 96-180px, opacity `0.08-0.16`, positioned near edges.
- Vertical labels: use `writing-mode: vertical-rl` for side metadata.
- Never replace critical English labels with kanji only. English is primary; kanji is atmosphere or secondary marking.
- One large kanji per major panel maximum.

Example:

```tsx
<span className="pointer-events-none absolute left-6 top-16 font-sans text-[9rem] font-semibold leading-none text-foreground/10">
  碁
</span>
```

## 5. Shape And Lines

The attached image is mostly rectangular with tiny softness. Follow that.

Radius:

- Shell panels: `rounded-[14px]`
- Cards: `rounded-[10px]`
- Buttons: `rounded-[999px]` for compact pills, `rounded-[6px]` for technical buttons.
- Board frame: `rounded-[14px]`
- Inner board: `rounded-[8px]`
- Avoid large bubbly radii.

Lines:

- Use visible grid structure: top bars, side rails, split panes, internal section lines.
- Prefer `border`, `border-r`, `border-b` over cards-with-shadows.
- Do not use thick Swiss brutalist borders anymore except during transitional cleanup.

## 6. Layout Model

Desktop shell:

```text
┌──────────────────────────────────────────────────────────────┐
│ top metadata rail: KOMI / room / player / auth state          │
├──────────────┬──────────────────────────────┬────────────────┤
│ vertical nav │ board stage                   │ right dossier  │
│ ghost kanji  │ Go board as instrument        │ players/info   │
│ metadata     │                              │ history/sensei │
└──────────────┴──────────────────────────────┴────────────────┘
```

Mobile shell:

```text
┌─────────────────────────────┐
│ compact top metadata         │
├─────────────────────────────┤
│ board                        │
├─────────────────────────────┤
│ bottom segmented panels      │
└─────────────────────────────┘
```

Layout rules:

- Board stays primary. It gets the calmest empty space.
- Dock/panels should feel attached to the global grid, not floating islands.
- Use side metadata rails with rotated/vertical text where useful.
- Keep panels line-based and internally divided.
- Avoid stacked “cards inside cards inside cards.”

## 7. Component Translation Guide

### Global Shell

Files:

- [app/globals.css](C:\Users\HP\dev\experiments\komi\app\globals.css)
- [app/layout.tsx](C:\Users\HP\dev\experiments\komi\app\layout.tsx)
- [components/providers.tsx](C:\Users\HP\dev\experiments\komi\components\providers.tsx)

Tasks:

- [x] Replace current token palette with fixed Kanji Grid tokens.
- [x] Remove theme switching and dark token dependency.
- [x] Load `Geist` and `JetBrains Mono`.
- [x] Set body background to mist blue-gray.
- [x] Remove default shadows from primitives where possible.

### Game Layout / Dock

Files:

- [components/layout/game-layout.tsx](C:\Users\HP\dev\experiments\komi\components\layout\game-layout.tsx)
- [components/pages/home-page-client.tsx](C:\Users\HP\dev\experiments\komi\components\pages\home-page-client.tsx)

Tasks:

- [x] Replace black brutalist dock with pale line-based rail.
- [x] Add ghost `碁` or `対局` to the rail at low opacity.
- [x] Make expanded panes extend from the rail as one continuous grid.
- [x] Use vertical metadata labels for secondary nav text.
- [x] Keep the board visually central with generous negative space.

### Board

Files:

- [components/game/go-board.tsx](C:\Users\HP\dev\experiments\komi\components\game\go-board.tsx)
- [components/game/intersection.tsx](C:\Users\HP\dev\experiments\komi\components\game\intersection.tsx)
- [components/game/stone.tsx](C:\Users\HP\dev\experiments\komi\components\game\stone.tsx)

Tasks:

- [x] Board frame becomes a quiet technical object, not a heavy toy block.
- [x] Use desaturated board wood against the pale UI.
- [x] Keep stones physical, but reduce glossy decoration.
- [x] Last move marker should be a thin ring or small red/signal dot.
- [x] Hover state should be a faint technical preview, not a glowing effect.

### Player Cards

Files:

- [components/game/player-card.tsx](C:\Users\HP\dev\experiments\komi\components\game\player-card.tsx)
- [components/game/timer.tsx](C:\Users\HP\dev\experiments\komi\components\game\timer.tsx)

Tasks:

- [ ] Convert avatars into small technical discs or outlined badges.
- [ ] Use `黒` and `白` as secondary stone labels.
- [ ] Timer becomes a mono instrument readout.
- [ ] Current player state uses a red/signal edge marker, not giant glow/shadow.

### History / Record

Files:

- [components/game/move-history-section.tsx](C:\Users\HP\dev\experiments\komi\components\game\move-history-section.tsx)
- [components/pages/game-history-page-client.tsx](C:\Users\HP\dev\experiments\komi\components\pages\game-history-page-client.tsx)

Tasks:

- [ ] Rename visual language around `記録`.
- [x] Use thin rows with date/move metadata like the reference itinerary list.
- [ ] Empty state is one terse line: `NO RECORD YET`.
- [ ] Move list should feel like a timetable, not chat bubbles.

### Sensei

Files:

- [components/learning/ai-chat-panel.tsx](C:\Users\HP\dev\experiments\komi\components\learning\ai-chat-panel.tsx)
- [components/learning/ai-reaction.tsx](C:\Users\HP\dev\experiments\komi\components\learning\ai-reaction.tsx)
- [components/learning/mobile-sensei-fab.tsx](C:\Users\HP\dev\experiments\komi\components\learning\mobile-sensei-fab.tsx)
- [components/mascot/ko-mascot.tsx](C:\Users\HP\dev\experiments\komi\components\mascot\ko-mascot.tsx)
- [components/mascot/ko-coach-stage.tsx](C:\Users\HP\dev\experiments\komi\components\mascot\ko-coach-stage.tsx)
- [components/mascot/sprite-animator.tsx](C:\Users\HP\dev\experiments\komi\components\mascot\sprite-animator.tsx)

Tasks:

- [x] Add a reusable sprite animator for Kō with stepped 2D-game frame playback.
- [x] Create a Kō mascot wrapper with game moods: idle, thinking, praise, warning, teaching, review.
- [x] Add a coach-stage layout where Kō can sit above the board with a speech card and HUD.
- [ ] Sensei panel title uses `先生`.
- [ ] Remove cartoon/chatbot feeling.
- [ ] Treat tutor output like a match note or coach annotation.
- [ ] No toast-style floating blob unless it is a strict bottom-right annotation card.
- [ ] Use `[LIVE]`, `[LOCAL]`, `[REVIEW]` mono status labels.

### Streak / Progress

Files:

- [components/learning/xp-bar.tsx](C:\Users\HP\dev\experiments\komi\components\learning\xp-bar.tsx)

Tasks:

- [ ] Keep vertical energy bars, but make them instrument-like.
- [ ] Bars use black/gray opacity first, red only for level change events.
- [ ] Label as `形 / SHAPE` or `RHYTHM`.
- [ ] No flames, emoji, or playful badge language.

### Game Over / Replay

Files:

- [components/game/game-over-dialog.tsx](C:\Users\HP\dev\experiments\komi\components\game\game-over-dialog.tsx)
- [components/game/post-game-review-card.tsx](C:\Users\HP\dev\experiments\komi\components\game\post-game-review-card.tsx)
- [components/game/replay-controls.tsx](C:\Users\HP\dev\experiments\komi\components\game\replay-controls.tsx)
- [components/pages/replay-page-client.tsx](C:\Users\HP\dev\experiments\komi\components\pages\replay-page-client.tsx)

Tasks:

- [ ] Game over becomes a match dossier, not a modal celebration.
- [ ] Use `勝` / `敗` as ghost marks.
- [ ] Replay controls become technical transport controls with mono labels.
- [ ] Review card uses itinerary-like rows: move number, coordinate, note.

### Profile / Account / Auth

Files:

- [app/profile/page.tsx](C:\Users\HP\dev\experiments\komi\app\profile\page.tsx)
- [app/account/[path]/page.tsx](C:\Users\HP\dev\experiments\komi\app\account\[path]\page.tsx)
- [app/auth/[path]/page.tsx](C:\Users\HP\dev\experiments\komi\app\auth\[path]\page.tsx)

Tasks:

- [x] Use the same pale grid shell.
- [x] Profile stats become technical dossier metrics.
- [x] Account/settings should feel like a control panel.
- [x] Auth should not look provider-default; wrap in Komi grid frame.

## 8. Motion Rules

Motion should be mechanical and sparse.

- Use `120-180ms` ease-out for hover/press.
- Use `240ms` for panel open/close.
- No bounce. No spring. No blob easing.
- GSAP is allowed for sequence-level transitions only: panel reveal, board entry, energy bars.
- Respect `prefers-reduced-motion`.

Recommended easing:

```ts
const KANJI_EASE = "power2.out"
```

## 9. Icon Rules

The final icon system should be thin-line and quiet.

- Prefer Hugeicons if available.
- Do not mix icon families inside a single component.
- Icons are tertiary; labels carry the meaning.
- Stroke width should feel like the border system: thin, precise.
- No emoji in UI.

## 10. Implementation Order

Follow this exact sequence so we do not restyle ourselves into chaos.

1. [x] Foundation: fonts, tokens, body, primitives.
2. [x] Main shell: `GameLayout` and global game route composition.
3. [x] Board: frame, stones, coordinates, hover, last move.
4. [ ] Right/dock panels: players, history, controls, mode, score.
5. [ ] Sensei: chat, annotation, mobile trigger.
6. [ ] Streak/progression: technical energy instrument.
7. [ ] Online room UI and presence.
8. [ ] Game-over and replay surfaces.
9. [x] History archive page.
10. [x] Profile page.
11. [x] Account/settings/auth pages.
12. [ ] Final audit: responsive, spacing, icons, motion, empty states.

## 11. Acceptance Checklist

- [x] One fixed theme only.
- [x] Geist and JetBrains Mono loaded and mapped.
- [ ] No purple/default AI gradients.
- [ ] No heavy black brutalist blocks unless deliberately retained as board data.
- [x] No big shadows in UI chrome.
- [x] Lines and grid structure define the layout.
- [x] Kanji appears as atmosphere, not as untranslated UX.
- [x] Board remains the primary object.
- [x] Dock and panels feel connected, not floating.
- [ ] Mobile uses the same visual grammar, not a simplified unrelated UI.
- [ ] Empty states are terse.
- [ ] Motion is mechanical and reduced-motion aware.

## 12. Quick Visual Test

When a screen is done, squint at it:

- Do you first see the board or the match result?
- Do the thin lines create a clear architecture?
- Is there only one accent event?
- Does every block feel aligned to an invisible poster grid?
- Could the screenshot sit next to the attached reference without looking like a different product?

If not, remove decoration before adding anything else.

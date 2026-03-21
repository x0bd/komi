# Komi — UI Restyle Roadmap (Apple x Vercel Aesthetic)

Step-by-step plan to transition from the current "Washi meets Sumi-e" aesthetic to a highly polished "Apple/Vercel" aesthetic (Glassmorphism, clean monochrome, glowing accents, Geist typography, deep shadows).

---

## Phase 1: Foundation & Design Tokens

- [x] **Typography & Fonts**
  - [x] Replace Bricolage Grotesque/DM Sans with Geist Sans & Geist Mono (or Inter).
  - [x] Update `layout.tsx` and `globals.css` font variables.
  - [x] Clean up font weights (favoring lighter weights or exact variable axes).
- [x] **Color Palette (Vercel/Apple Core)**
  - [x] Replace Washi/Sumi-e palette with high-contrast grayscale (pure black `#000` background in dark mode, pure white text).
  - [x] Add Vercel-like subtle glowing accent colors (cyan, magenta, blue).
  - [x] Ensure light mode has a clean off-white/gray background with ultra-subtle borders.
- [x] **Tailwind Configuration**
  - [x] Add backdrop-blur utilities and glassmorphic base classes.
  - [x] Update keyframe animations (snappier, Apple-like spring animations, Vercel glowing pulse).
  - [x] Remove `.board-texture` and other tactile noise utilities.
- [x] **shadcn Component Theming**
  - [x] Update `Button` to have Apple-style pills or Vercel crisp edges.
  - [x] Update `Card` to use subtle borders (e.g. `border-white/10`) and frosted glass backgrounds.
  - [x] Adjust `Badge`, `DropdownMenu`, and other primitives for a minimal, tech-focused feel.

## Phase 2: Layout & Navigation Redesign

- [x] **Main Layout Redesign** (`components/layout/game-layout.tsx`)
  - [x] Remove ambient glow and Washi textures from the background.
  - [x] Implement an edge-to-edge layout.
  - [x] Sidebar: Redesign to be a floating "Inspector" panel (Apple macOS style) with backdrop blur.
- [x] **Navigation & Chrome**
  - [x] Update header/mobile nav to use a dynamic island style or translucent blurred navbars.

## Phase 3: Board UI Overhaul

- [x] **Board Visuals** (`components/game/go-board.tsx`)
  - [x] Remove wood/washi textures.
  - [x] Replace grid lines with crisp 1px subtle strokes (e.g., `border-zinc-800` in dark mode).
  - [x] Hoshi points: Minimal solid dots or subtle rings.
- [x] **Stones Redesign** (`components/game/stone.tsx`)
  - [x] Black stones: Deep obsidian with a subtle specular highlight (Apple polished glass).
  - [x] White stones: Pure matte white or frosted glass with soft, deep drop shadows.
  - [x] Update placement animations to a crisp, bouncy spring (framer-motion or high-tension CSS transition).

## Phase 4: Sidebar & Game Controls Redesign

- [x] **Player Cards & Info** (`components/game/player-card.tsx`)
  - [x] Convert to minimalist glass cards.
  - [x] Use Vercel-style avatar rings.
- [x] **Controls & Timers** (`components/game/timer.tsx`, `components/game/game-controls.tsx`)
  - [x] Digital/Mono typography for timers (Geist Mono).
  - [x] Minimal icon-only buttons for controls with subtle hover states.
- [x] **Move History & Analysis** (`components/game/move-history.tsx`)
  - [x] Clean up lists with faint divider lines.
  - [x] Update typography to be strictly utilitarian and legible.

## Phase 5: Learning & Gamification UI Update

- [x] **AI Chat Panel (Sensei)** (`components/learning/ai-chat-panel.tsx`)
  - [x] Redesign chat bubbles (iMessage style or Vercel AI SDK chat style).
  - [x] Clean up input field (floating pill with blur, minimal border).
- [x] **XP Bar & Progression** (`components/learning/xp-bar.tsx`)
  - [x] Replace playful gamification with sleek, glowing progress bars (Vercel status indicators).

## Phase 6: Polish & Animations

- [x] **Transitions & Micro-interactions**
  - [x] Add page transition animations.
  - [x] Ensure all hover states have instant or extremely snappy (150ms) easing.
- [x] **Dark Mode Refinement**
  - [x] Ensure pure black `#000` is used for deep backgrounds to leverage OLED displays (Apple standard).
  - [x] Review all borders to ensure they are high-contrast but thin (1px, low opacity).

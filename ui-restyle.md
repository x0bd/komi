# Komi — UI Restyle Roadmap (Apple x Vercel Aesthetic)

Step-by-step plan to transition from the current "Washi meets Sumi-e" aesthetic to a highly polished "Apple/Vercel" aesthetic (Glassmorphism, clean monochrome, glowing accents, Geist typography, deep shadows).

---

## Phase 1: Foundation & Design Tokens

- [ ] **Typography & Fonts**
  - [ ] Replace Bricolage Grotesque/DM Sans with Geist Sans & Geist Mono (or Inter).
  - [ ] Update `layout.tsx` and `globals.css` font variables.
  - [ ] Clean up font weights (favoring lighter weights or exact variable axes).
- [ ] **Color Palette (Vercel/Apple Core)**
  - [ ] Replace Washi/Sumi-e palette with high-contrast grayscale (pure black `#000` background in dark mode, pure white text).
  - [ ] Add Vercel-like subtle glowing accent colors (cyan, magenta, blue).
  - [ ] Ensure light mode has a clean off-white/gray background with ultra-subtle borders.
- [ ] **Tailwind Configuration**
  - [ ] Add backdrop-blur utilities and glassmorphic base classes.
  - [ ] Update keyframe animations (snappier, Apple-like spring animations, Vercel glowing pulse).
  - [ ] Remove `.board-texture` and other tactile noise utilities.
- [ ] **shadcn Component Theming**
  - [ ] Update `Button` to have Apple-style pills or Vercel crisp edges.
  - [ ] Update `Card` to use subtle borders (e.g. `border-white/10`) and frosted glass backgrounds.
  - [ ] Adjust `Badge`, `DropdownMenu`, and other primitives for a minimal, tech-focused feel.

## Phase 2: Layout & Navigation Redesign

- [ ] **Main Layout Redesign** (`components/layout/game-layout.tsx`)
  - [ ] Remove ambient glow and Washi textures from the background.
  - [ ] Implement an edge-to-edge layout.
  - [ ] Sidebar: Redesign to be a floating "Inspector" panel (Apple macOS style) with backdrop blur.
- [ ] **Navigation & Chrome**
  - [ ] Update header/mobile nav to use a dynamic island style or translucent blurred navbars.

## Phase 3: Board UI Overhaul

- [ ] **Board Visuals** (`components/game/go-board.tsx`)
  - [ ] Remove wood/washi textures.
  - [ ] Replace grid lines with crisp 1px subtle strokes (e.g., `border-zinc-800` in dark mode).
  - [ ] Hoshi points: Minimal solid dots or subtle rings.
- [ ] **Stones Redesign** (`components/game/stone.tsx`)
  - [ ] Black stones: Deep obsidian with a subtle specular highlight (Apple polished glass).
  - [ ] White stones: Pure matte white or frosted glass with soft, deep drop shadows.
  - [ ] Update placement animations to a crisp, bouncy spring (framer-motion or high-tension CSS transition).

## Phase 4: Sidebar & Game Controls Redesign

- [ ] **Player Cards & Info** (`components/game/player-card.tsx`)
  - [ ] Convert to minimalist glass cards.
  - [ ] Use Vercel-style avatar rings.
- [ ] **Controls & Timers** (`components/game/timer.tsx`, `components/game/game-controls.tsx`)
  - [ ] Digital/Mono typography for timers (Geist Mono).
  - [ ] Minimal icon-only buttons for controls with subtle hover states.
- [ ] **Move History & Analysis** (`components/game/move-history.tsx`)
  - [ ] Clean up lists with faint divider lines.
  - [ ] Update typography to be strictly utilitarian and legible.

## Phase 5: Learning & Gamification UI Update

- [ ] **AI Chat Panel (Sensei)** (`components/learning/ai-chat-panel.tsx`)
  - [ ] Redesign chat bubbles (iMessage style or Vercel AI SDK chat style).
  - [ ] Clean up input field (floating pill with blur, minimal border).
- [ ] **XP Bar & Progression** (`components/learning/xp-bar.tsx`)
  - [ ] Replace playful gamification with sleek, glowing progress bars (Vercel status indicators).

## Phase 6: Polish & Animations

- [ ] **Transitions & Micro-interactions**
  - [ ] Add page transition animations.
  - [ ] Ensure all hover states have instant or extremely snappy (150ms) easing.
- [ ] **Dark Mode Refinement**
  - [ ] Ensure pure black `#000` is used for deep backgrounds to leverage OLED displays (Apple standard).
  - [ ] Review all borders to ensure they are high-contrast but thin (1px, low opacity).

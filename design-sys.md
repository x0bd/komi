# Komi Design System

A comprehensive design system for Komi — a modern multiplayer Go platform. This document defines the visual language, token system, component patterns, and implementation guidance for building Komi with Next.js, Tailwind CSS v4, and shadcn/ui (`base-maia` style).

---

## Design Philosophy

Komi's visual identity lives at the intersection of three qualities:

1. **Warmth** — Earthy, wood-inspired tones that honor Go's centuries-old tradition. The board should feel like a physical object you want to touch.
2. **Clarity** — Clean spatial hierarchy with generous whitespace. Every element has purpose. Information is glanceable, never cluttered.
3. **Delight** — Tactile micro-interactions, smooth stone animations, and playful flourishes that reward attention without distracting from gameplay.

The aesthetic is **modern wabi-sabi** — refined imperfection. Not sterile tech-product UI, not cartoonish. Think: a beautifully crafted wooden board on a clean concrete desk, lit by warm afternoon light.

---

## Color System

### Semantic Tokens (CSS Custom Properties)

The palette is built on warm neutrals with intentional accent punctuation. All colors use `oklch` for perceptual uniformity and are mapped to shadcn's token system.

#### Light Theme (Default)

```css
:root {
  /* ── Surface Hierarchy ── */
  --background: oklch(0.97 0.005 85);          /* warm off-white, faint cream */
  --foreground: oklch(0.22 0.02 50);            /* deep espresso brown */
  --card: oklch(0.99 0.003 85);                 /* slightly warmer white */
  --card-foreground: oklch(0.22 0.02 50);
  --popover: oklch(0.99 0.003 85);
  --popover-foreground: oklch(0.22 0.02 50);

  /* ── Brand / Primary ── */
  --primary: oklch(0.35 0.05 50);               /* rich umber brown */
  --primary-foreground: oklch(0.97 0.005 85);

  /* ── Secondary ── */
  --secondary: oklch(0.94 0.01 75);             /* warm sand */
  --secondary-foreground: oklch(0.35 0.05 50);

  /* ── Muted ── */
  --muted: oklch(0.93 0.01 80);                 /* light warm gray */
  --muted-foreground: oklch(0.55 0.03 55);      /* medium brown */

  /* ── Accent ── */
  --accent: oklch(0.80 0.14 75);                /* warm amber gold */
  --accent-foreground: oklch(0.25 0.04 50);

  /* ── Destructive ── */
  --destructive: oklch(0.62 0.20 30);           /* burnt terracotta */

  /* ── Borders & Inputs ── */
  --border: oklch(0.88 0.015 70);               /* warm light border */
  --input: oklch(0.90 0.012 75);
  --ring: oklch(0.70 0.08 65);                  /* warm focus ring */

  /* ── Radius ── */
  --radius: 0.75rem;
}
```

#### Dark Theme

```css
.dark {
  --background: oklch(0.16 0.015 55);           /* deep warm charcoal */
  --foreground: oklch(0.93 0.01 80);            /* warm off-white */
  --card: oklch(0.20 0.015 55);                 /* elevated surface */
  --card-foreground: oklch(0.93 0.01 80);
  --popover: oklch(0.22 0.015 55);
  --popover-foreground: oklch(0.93 0.01 80);

  --primary: oklch(0.80 0.10 75);               /* warm gold */
  --primary-foreground: oklch(0.16 0.015 55);

  --secondary: oklch(0.25 0.015 55);
  --secondary-foreground: oklch(0.90 0.01 80);

  --muted: oklch(0.25 0.015 55);
  --muted-foreground: oklch(0.65 0.03 65);

  --accent: oklch(0.72 0.12 70);                /* muted gold */
  --accent-foreground: oklch(0.16 0.015 55);

  --destructive: oklch(0.65 0.18 28);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.55 0.06 60);
}
```

### Extended Palette (Game-Specific)

Beyond shadcn's semantic tokens, Komi needs game-specific colors:

```css
:root {
  /* ── Board ── */
  --board-surface: oklch(0.82 0.08 80);         /* warm wood / honey amber */
  --board-frame: oklch(0.60 0.10 55);           /* darker wood frame */
  --board-grid: oklch(0.35 0.04 55);            /* grid lines, soft brown */
  --board-hoshi: oklch(0.30 0.04 55);           /* star points */

  /* ── Stones ── */
  --stone-black: oklch(0.20 0.02 50);           /* near-black with warm shift */
  --stone-black-highlight: oklch(0.35 0.02 50); /* specular on black stone */
  --stone-white: oklch(0.97 0.005 85);          /* warm white */
  --stone-white-highlight: oklch(1.0 0 0);      /* pure white specular */
  --stone-white-border: oklch(0.88 0.01 75);    /* subtle edge definition */
  --stone-shadow: oklch(0.20 0.02 50 / 25%);    /* drop shadow under stones */

  /* ── Status / Feedback ── */
  --status-active: oklch(0.72 0.15 145);        /* sage green — player active */
  --status-waiting: oklch(0.65 0.03 65);        /* muted — waiting */
  --status-capture: oklch(0.70 0.16 50);        /* warm coral — captures */
  --status-territory: oklch(0.75 0.12 145);     /* soft green — territory */
  --status-danger: oklch(0.62 0.20 30);         /* terracotta — low time, resign */

  /* ── AI Tutor ── */
  --tutor-surface: oklch(0.92 0.04 165);        /* soft teal tint */
  --tutor-accent: oklch(0.70 0.12 170);         /* teal */
  --tutor-foreground: oklch(0.25 0.03 55);

  /* ── XP / Gamification ── */
  --xp-bar-bg: oklch(0.94 0.01 80);
  --xp-bar-fill-start: oklch(0.72 0.15 145);   /* green */
  --xp-bar-fill-end: oklch(0.82 0.15 95);      /* gold */
  --xp-streak: oklch(0.68 0.18 45);             /* warm orange */
}
```

### Color Usage Guidelines

| Context | Token | Notes |
|---------|-------|-------|
| Page background | `--background` | Warm cream, never pure white |
| Board wood | `--board-surface` | The heart of the visual identity |
| Primary actions | `--primary` | Rich brown — buttons, links |
| Gold accent | `--accent` | Highlights, active states, badges |
| Black stones | `--stone-black` | With radial gradient for 3D depth |
| White stones | `--stone-white` | With subtle border + soft shadow |
| Active player indicator | `--status-active` | Green glow/border |
| Capture count | `--status-capture` | Coral badge |
| AI Tutor chat | `--tutor-surface` | Distinct from game UI |
| Destructive actions | `--destructive` | Resign, leave game |

---

## Typography

### Font Stack

```css
:root {
  /* Display — headings, game labels, player names, buttons */
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif;

  /* Body — move history, chat messages, descriptions */
  --font-body: 'DM Sans', system-ui, sans-serif;

  /* Mono — timers, coordinates, move notation */
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

**Bricolage Grotesque** — A variable-width grotesque with optical sizing and a warm, slightly quirky character. It has the friendliness of Fredoka (from the inspo) but with more sophistication and better readability at scale. Available on Google Fonts with `wght` and `opsz` axes.

**DM Sans** — Clean geometric sans with excellent legibility at small sizes. Warm enough to complement Bricolage without competing. Use for body copy, move history, sidebar text.

**JetBrains Mono** — Crisp monospace for game data — timers, coordinates, SGF notation. Its ligatures and distinct character shapes prevent misreads during fast play.

### Type Scale

Use Tailwind's built-in scale, extended for game-specific sizes:

| Use Case | Class | Size | Weight | Font |
|----------|-------|------|--------|------|
| Page title / Logo | `text-3xl` | 30px | 800 | Display |
| Section heading | `text-xl` | 20px | 700 | Display |
| Player name | `text-lg` | 18px | 700 | Display |
| Button label | `text-base` | 16px | 600 | Display |
| Body / History items | `text-sm` | 14px | 500 | Body |
| Badge / Status | `text-xs` | 12px | 700 | Body |
| Timer | `text-2xl` | 24px | 700 | Mono |
| Board coordinates | `text-xs` | 12px | 600 | Mono |
| Move notation | `text-sm` | 14px | 600 | Mono |

### Implementation

Register fonts in `app/layout.tsx` via `next/font/google`:

```tsx
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from 'next/font/google'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})
```

Map to Tailwind in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-body);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);
}
```

Use via utilities: `font-display`, `font-sans`, `font-mono`.

---

## Spacing & Layout

### Board-First Layout

The Go board is the gravitational center. Everything else orbits it.

```
┌─────────────────────────────────────────────────────┐
│                    TOPBAR (optional)                  │
├──────────────────────────┬──────────────────────────┤
│                          │   Mode Toggle             │
│                          │   Player 1 Card           │
│       GO BOARD           │   Player 2 Card           │
│     (flex: 1, centered)  │   History / Moves         │
│                          │   AI Tutor (conditional)  │
│                          │   XP Bar (conditional)    │
│                          │   Actions (Pass/Resign)   │
├──────────────────────────┴──────────────────────────┤
│              (mobile: stacked vertically)             │
└─────────────────────────────────────────────────────┘
```

- **Desktop** (`>=1024px`): Two-column flex layout — board takes available space, sidebar is fixed-width (`380px`).
- **Tablet** (`>=768px`): Board shrinks, sidebar narrows (`320px`).
- **Mobile** (`<768px`): Single column. Board on top (full width, square aspect-ratio constrained), sidebar scrolls below.

### Spacing Tokens

Stick to Tailwind's default scale. Key recurring values:

| Token | Value | Use |
|-------|-------|-----|
| `gap-3` | 12px | Inside cards, between badges |
| `gap-4` | 16px | Between player info elements |
| `gap-5` | 20px | Between sidebar sections |
| `gap-6` | 24px | Card internal padding |
| `p-5` | 20px | Card padding (compact) |
| `p-6` | 24px | Card padding (standard) |
| `p-8` | 32px | Board container padding |
| `rounded-2xl` | `var(--radius-2xl)` | Cards, panels |
| `rounded-3xl` | `var(--radius-3xl)` | Board container |
| `rounded-full` | 9999px | Badges, avatars, toggles |

---

## Shadows & Elevation

A layered shadow system that references the tactile, "offset" shadows from the inspo files — but refined for production:

```css
:root {
  /* Resting state — subtle lift */
  --shadow-sm: 0 1px 2px oklch(0.20 0.02 50 / 6%);

  /* Cards, panels — soft warm shadow */
  --shadow-md: 0 4px 12px oklch(0.20 0.02 50 / 8%),
               0 1px 3px oklch(0.20 0.02 50 / 5%);

  /* Active card, hovered — elevated */
  --shadow-lg: 0 8px 24px oklch(0.20 0.02 50 / 10%),
               0 2px 6px oklch(0.20 0.02 50 / 6%);

  /* Board container — heavy, grounding */
  --shadow-board: 0 16px 48px oklch(0.20 0.02 50 / 12%),
                  0 4px 12px oklch(0.20 0.02 50 / 8%);

  /* Retro offset (use sparingly for playful accents) */
  --shadow-offset: 4px 4px 0px oklch(0.20 0.02 50 / 12%);
}
```

In Tailwind, extend via `@theme inline` or apply directly with arbitrary values.

---

## Border System

Borders carry personality. Drawing from the inspo files' chunky border style, adapted to be context-appropriate:

| Context | Style | Notes |
|---------|-------|-------|
| Cards / Panels | `border border-border` | 1px, subtle in light mode |
| Active player card | `border-2 border-accent` | Gold highlight |
| Board container | `border-2 border-primary/20` | Warm definition |
| Buttons (primary) | `border-none` | Rely on fill color |
| Buttons (secondary) | `border border-border` | Outlined style |
| Badges | `border-none` | Pill-shaped, fill only |
| Board grid lines | Rendered via SVG/Canvas | Not CSS borders |
| Mode toggle | `border border-border rounded-full` | Pill container |

---

## Component Patterns

### Mapping shadcn Components to Komi UI

The project uses shadcn `base-maia` style with `hugeicons`. Here's how each shadcn primitive maps to Komi's interface:

#### Buttons (`components/ui/button.tsx`)

| Variant | Komi Use | Style Notes |
|---------|----------|-------------|
| `default` | Primary actions (Find Match, Play Again) | `bg-primary` warm brown, `font-display font-semibold` |
| `secondary` | Pass turn, secondary actions | `bg-secondary` warm sand fill |
| `destructive` | Resign | Terracotta `bg-destructive` |
| `outline` | Tertiary actions | Border-only, warm border |
| `ghost` | Toolbar icons, compact actions | No fill, hover reveals warm tint |

Custom variant to add — **`accent`**:

```tsx
accent: "bg-accent text-accent-foreground font-display font-semibold shadow-sm hover:bg-accent/90"
```

Used for gold CTA buttons (Play Again, Start Game).

#### Cards (`components/ui/card.tsx`)

The primary container for all sidebar panels. Customize:

```tsx
<Card className="rounded-2xl border-border shadow-md bg-card">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

**Active player card** gets an additional treatment:

```tsx
<Card className={cn(
  "rounded-2xl border shadow-md transition-all duration-300",
  isActive && "border-accent shadow-lg -translate-y-1 bg-card"
)}>
```

#### Avatar (`components/ui/avatar.tsx`)

Player avatars in cards:

```tsx
<Avatar className="h-14 w-14 border-2 border-primary/20">
  <AvatarImage src={player.avatar} />
  <AvatarFallback className="bg-status-active text-white font-display font-bold">
    {player.initials}
  </AvatarFallback>
</Avatar>
```

Color-code fallbacks:
- Player 1 (Black): `bg-[--status-active]` (sage green)
- Player 2 (White): `bg-[--status-capture]` (coral)
- AI: `bg-primary` (umber brown)

#### Badge (`components/ui/badge.tsx`)

Used for stone color labels, capture counts, move counts:

```tsx
<Badge variant="secondary" className="rounded-full font-mono text-xs">
  <span className="inline-block h-3 w-3 rounded-full bg-stone-black border border-white/20" />
  Black
</Badge>

<Badge variant="default" className="rounded-full font-mono tabular-nums">
  ⬤ {captures}
</Badge>
```

#### Tabs / Toggle Group (`components/ui/toggle-group.tsx`)

For the game mode switcher (Local / Versus AI / Online):

```tsx
<ToggleGroup
  type="single"
  value={gameMode}
  onValueChange={setGameMode}
  className="bg-secondary rounded-full p-1 border border-border"
>
  <ToggleGroupItem
    value="local"
    className="rounded-full px-6 font-display font-semibold text-sm
               data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
               data-[state=on]:shadow-sm transition-all"
  >
    Local
  </ToggleGroupItem>
  <ToggleGroupItem value="ai" className="...">
    Versus AI
  </ToggleGroupItem>
  <ToggleGroupItem value="online" className="...">
    Online
  </ToggleGroupItem>
</ToggleGroup>
```

#### ScrollArea (`components/ui/scroll-area.tsx`)

For the move history list — ensures smooth scrolling with styled scrollbar:

```tsx
<ScrollArea className="flex-1">
  <div className="flex flex-col gap-2 pr-3">
    {moves.map(move => <MoveItem key={move.num} {...move} />)}
  </div>
</ScrollArea>
```

#### Dialog (`components/ui/dialog.tsx`)

Game over modal, resign confirmation:

```tsx
<Dialog open={isGameOver}>
  <DialogContent className="rounded-3xl border-border shadow-board max-w-sm">
    <DialogHeader>
      <DialogTitle className="font-display text-2xl">Game Over</DialogTitle>
      <DialogDescription>{resultText}</DialogDescription>
    </DialogHeader>
    <Button variant="accent" onClick={resetGame} className="w-full">
      Play Again
    </Button>
  </DialogContent>
</Dialog>
```

#### Tooltip (`components/ui/tooltip.tsx`)

Board intersection hints, button labels:

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <PassIcon />
    </Button>
  </TooltipTrigger>
  <TooltipContent className="font-body text-xs">
    Pass your turn
  </TooltipContent>
</Tooltip>
```

#### Drawer (`components/ui/drawer.tsx`)

Mobile-only: slide-up panel for move history, AI tutor:

```tsx
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline" size="sm">History</Button>
  </DrawerTrigger>
  <DrawerContent className="rounded-t-3xl">
    <MoveHistory moves={moveHistory} />
  </DrawerContent>
</Drawer>
```

#### Sonner / Toast (`components/ui/sonner.tsx`)

Capture notifications, connection status, AI tutor tips:

```tsx
toast("Captured 3 stones!", {
  description: "Nice move — those count as points at the end.",
  icon: "⚔️",
})
```

#### Progress (`components/ui/progress.tsx`)

XP bar / streak progress:

```tsx
<Progress
  value={xpPercent}
  className="h-2.5 rounded-full bg-[--xp-bar-bg]
             [&>div]:bg-gradient-to-r [&>div]:from-[--xp-bar-fill-start] [&>div]:to-[--xp-bar-fill-end]
             [&>div]:rounded-full"
/>
```

#### Separator (`components/ui/separator.tsx`)

Between sidebar sections when needed — keep sparse.

---

## Game-Specific Components (Custom)

These don't come from shadcn and are built bespoke:

### `<GoBoard />`

The central game board. Rendered as a CSS Grid (19x19) layered over an SVG grid.

**Structure:**

```
<div className="board-container">     ← outer frame (wood border, shadow)
  <div className="board-surface">     ← inner board (wood grain bg)
    <svg className="grid-layer" />    ← lines, hoshi points
    <div className="intersections">   ← 19x19 grid of clickable cells
      <Intersection />
      <Intersection />
      ...
    </div>
    <CoordinateLabels />              ← A-T top, 19-1 left
  </div>
</div>
```

**Board container styling:**

```tsx
className="relative rounded-3xl border-2 border-primary/15 p-6 md:p-8
           bg-[--board-frame] shadow-board"
```

**Board surface (inner):**

```tsx
className="relative rounded-2xl overflow-hidden bg-[--board-surface]"
```

Consider applying a subtle CSS noise texture or wood-grain `background-image` to `--board-surface` for tactile warmth.

### `<Stone />`

Rendered as a `<div>` with radial gradient for a 3D look (inspired by go-2):

```tsx
// Black stone
className="rounded-full w-[92%] h-[92%]
           bg-[radial-gradient(circle_at_30%_30%,_var(--stone-black-highlight),_var(--stone-black))]
           shadow-[2px_3px_6px_var(--stone-shadow)]
           animate-in zoom-in-0 duration-300"

// White stone
className="rounded-full w-[92%] h-[92%]
           bg-[radial-gradient(circle_at_30%_30%,_var(--stone-white-highlight),_var(--stone-white))]
           border border-[--stone-white-border]
           shadow-[2px_3px_6px_var(--stone-shadow)]
           animate-in zoom-in-0 duration-300"
```

### `<LastMoveMarker />`

A small indicator dot centered on the last-placed stone:

```tsx
className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
           w-[35%] h-[35%] rounded-full
           bg-accent shadow-[0_0_6px_var(--accent)]"
```

### `<Intersection />`

Each clickable point on the board. Shows hover preview when empty:

```tsx
className="relative flex items-center justify-center cursor-pointer
           group"

// Hover ghost stone (on empty intersections)
<div className="hidden group-hover:block w-1/2 h-1/2 rounded-full
                bg-primary/15 transition-opacity" />
```

### `<Timer />`

Monospace countdown per player:

```tsx
className="font-mono text-2xl font-bold tabular-nums tracking-tight
           text-foreground"
```

When time is low (<60s), add urgency:

```tsx
className={cn(
  "font-mono text-2xl font-bold tabular-nums",
  timeRemaining < 60 && "text-destructive animate-pulse"
)}
```

### `<PlayerCard />`

Combines Avatar + Name + Badges + Timer. Uses shadcn `Card` as base:

```tsx
<Card className={cn(
  "rounded-2xl transition-all duration-300",
  isActive
    ? "border-accent shadow-lg -translate-y-0.5"
    : "border-border shadow-sm opacity-85"
)}>
  <CardContent className="flex items-center gap-4 p-5">
    <Avatar />
    <div className="flex-1">
      <p className="font-display font-bold text-lg">{name}</p>
      <div className="flex gap-2 mt-1">
        <Badge>Black</Badge>
        <Badge>⬤ {captures}</Badge>
      </div>
    </div>
    <Timer seconds={timeRemaining} />
  </CardContent>
</Card>
```

### `<AIChatPanel />`

The Sensei Bot tutor panel (from go-3 inspo). A mini-chat with tip chips:

```tsx
<Card className="rounded-2xl overflow-hidden border-[--tutor-accent]/30">
  {/* Header */}
  <div className="bg-[--tutor-accent] px-4 py-3 flex items-center gap-3">
    <Avatar className="h-8 w-8 border border-white/20">
      <AvatarFallback>🤖</AvatarFallback>
    </Avatar>
    <span className="font-display font-bold text-sm text-white flex-1">Sensei</span>
    <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_6px] shadow-green-300" />
  </div>

  {/* Messages */}
  <ScrollArea className="p-3 max-h-32">
    {messages.map(msg => (
      <div className="rounded-xl rounded-bl-sm px-3 py-2 text-xs
                      bg-[--tutor-surface] text-[--tutor-foreground] mb-2">
        {msg.text}
      </div>
    ))}
  </ScrollArea>

  {/* Quick Tips */}
  <div className="flex gap-1.5 px-3 pb-3 flex-wrap">
    <Badge variant="outline" className="cursor-pointer hover:bg-accent/10 text-[10px]">
      Opening tips
    </Badge>
    ...
  </div>
</Card>
```

### `<XPBar />`

Gamification streak tracker (from go-3 inspo):

```tsx
<Card className="rounded-2xl">
  <CardContent className="flex items-center gap-3 p-4">
    <span className="text-xl">🔥</span>
    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
        Today's Streak
      </p>
      <Progress value={fillPercent} className="h-2" />
    </div>
    <span className="font-display font-extrabold text-[--xp-streak]">
      {streak}
    </span>
  </CardContent>
</Card>
```

---

## Animation & Motion

### Stone Placement

The signature interaction. A fast, bouncy scale-in:

```css
@keyframes stone-place {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}
```

Duration: `300ms`. Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot).

Apply via Tailwind's `animate-in` from `tw-animate-css`, or define a custom `animation-stone-place` utility.

### Stone Capture

When stones are removed from the board:

```css
@keyframes stone-capture {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.6; }
  100% { transform: scale(0); opacity: 0; }
}
```

Duration: `250ms`. Easing: `ease-in`.

### Active Card Lift

Player card transitions when it becomes their turn:

```
transition-all duration-300 ease-out
-translate-y-0.5 shadow-lg border-accent
```

### Hover States

- **Intersection hover**: Ghost stone fades in at 15% opacity, `transition-opacity duration-150`.
- **Button hover**: `scale(1.02)` + shadow increase, `transition-all duration-150`.
- **Card hover** (non-active): subtle border color shift, `transition-colors duration-200`.

### Modal Entry

Scale + fade for the game-over dialog:

```
animate-in fade-in-0 zoom-in-95 duration-300
```

Use shadcn Dialog's built-in animation classes.

### GSAP (Advanced)

GSAP is already in dependencies. Reserve for:
- Board entrance animation on page load (grid lines draw in, then stones appear)
- Post-game review timeline scrubbing
- Territory visualization morphing
- Complex sequenced animations that CSS can't handle

---

## Iconography

The project uses **Hugeicons** (`@hugeicons/react`, `@hugeicons/core-free-icons`). Use these for all UI icons.

| Concept | Suggested Icon | Context |
|---------|---------------|---------|
| Pass turn | `ArrowTurnForward` | Action button |
| Resign | `Flag01` | Action button |
| Settings | `Settings01` | Top bar |
| Game history | `Clock01` | Sidebar panel header |
| AI tutor | `AiBrain` | Chat panel |
| Captures | `Target01` | Badge icon |
| Territory | `GridView` | Analysis |
| Share/Export | `Share01` | Post-game |
| Undo | `ArrowUndo` | Review mode |
| Redo | `ArrowRedo` | Review mode |
| Play | `Play` | Replay |
| Pause | `Pause` | Replay |
| Sound on | `Volume01` | Settings |
| Sound off | `VolumeMute` | Settings |
| Online | `Wifi01` | Status |

All icons should use `strokeWidth={1.8}` at `size={20}` for consistency with the `base-maia` style.

---

## Board Rendering Strategy

### CSS Grid Approach (Default)

The board is a 19x19 CSS grid. Grid lines are rendered as an absolutely-positioned SVG underneath the intersection layer. This is the approach from the visual inspo files and works well for the initial implementation.

```tsx
<div className="grid grid-cols-19 grid-rows-19 w-[600px] h-[600px] relative">
  <svg className="absolute inset-0 pointer-events-none z-0">
    {/* Vertical lines */}
    {/* Horizontal lines */}
    {/* Hoshi dots */}
  </svg>
  {intersections.map(cell => <Intersection key={cell.id} {...cell} />)}
</div>
```

Extend Tailwind for the 19-column grid:

```css
@theme inline {
  --grid-template-columns-19: repeat(19, 1fr);
  --grid-template-rows-19: repeat(19, 1fr);
}
```

### Canvas/Three.js Approach (Future)

For enhanced visuals (wood grain texture, stone lighting, shadow casting, particle effects on captures), migrate board rendering to:
- **Canvas 2D** for a lightweight upgrade with better texture support
- **Three.js** (already in the idea.md tech stack) for full 3D board rendering with camera angles, lighting, and post-processing

The component API should remain the same — only the rendering internals change.

---

## Responsive Behavior

| Breakpoint | Layout | Board Size | Sidebar |
|------------|--------|------------|---------|
| `>=1280px` | Side-by-side | 600px | 380px fixed |
| `>=1024px` | Side-by-side | 520px | 340px fixed |
| `>=768px` | Side-by-side (compact) | 440px | 300px fixed |
| `<768px` | Stacked | 100vw - 32px (max 400px) | Full width, below board |

On mobile (`<768px`):
- Board fills width with padding, maintains square aspect ratio
- Sidebar sections become collapsible or moved to a bottom drawer
- Move history becomes a swipe-up `<Drawer />`
- AI tutor becomes a floating action button that opens a sheet
- Player cards become compact horizontal bars pinned top/bottom

---

## Accessibility

- All interactive elements must have clear focus states using `--ring`
- Stone colors are distinguished by shape as well (last-move marker, hover indicators)
- Timer uses `aria-live="polite"` for screen reader updates
- Board intersections use `role="button"` with `aria-label="Intersection A1, empty"` (or "black stone", "white stone")
- Color contrast ratios meet WCAG AA for all text on their respective backgrounds
- Keyboard navigation: arrow keys to move between intersections, Enter/Space to place stone
- Reduced motion: respect `prefers-reduced-motion` — disable stone bounce, use instant transitions

---

## File Organization

```
components/
├── ui/                      # shadcn primitives (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── ...
│
├── game/                    # game-specific UI
│   ├── go-board.tsx         # board container + grid + intersections
│   ├── stone.tsx            # stone rendering with radial gradient
│   ├── intersection.tsx     # single board point (click handler, hover)
│   ├── coordinate-labels.tsx
│   ├── player-card.tsx      # avatar + name + badges + timer
│   ├── timer.tsx            # countdown display
│   ├── move-history.tsx     # scrollable move list
│   ├── game-controls.tsx    # pass / resign buttons
│   ├── mode-toggle.tsx      # local / ai / online switcher
│   ├── game-over-dialog.tsx # result modal
│   └── last-move-marker.tsx
│
├── learning/                # AI tutor / gamification
│   ├── ai-chat-panel.tsx    # sensei bot
│   ├── xp-bar.tsx           # streak + progress
│   └── tip-chips.tsx        # quick-action topic buttons
│
└── layout/                  # page structure
    ├── game-layout.tsx      # board + sidebar responsive container
    ├── topbar.tsx
    └── mobile-drawer.tsx
```

---

## Summary

| Principle | Implementation |
|-----------|---------------|
| **Warm, not sterile** | oklch colors with warm undertones, wood-inspired board, cream backgrounds |
| **Tactile, not flat** | Radial gradient stones, layered shadows, bouncy spring animations |
| **Clear, not cluttered** | Generous spacing, type hierarchy, muted inactive states |
| **Playful, not cartoonish** | Bricolage Grotesque over Fredoka, refined shadows over chunky offsets |
| **Accessible, not exclusionary** | Shape + color distinction, keyboard nav, screen reader labels |
| **shadcn-native** | Every non-game element maps to a shadcn primitive, themed via CSS variables |

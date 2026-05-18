import Link from "next/link"

export default function LandingPage() {
    return (
        <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">

            {/* Illustration — bleeds into matching background, no container */}
            <img
                src="/landing/komi-temple.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-[92%] w-auto select-none object-contain object-left-bottom"
            />

            {/* Blueprint grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.11]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgb(45 53 66 / 0.55) 1px, transparent 1px), linear-gradient(90deg, rgb(45 53 66 / 0.55) 1px, transparent 1px)",
                    backgroundSize: "54px 54px",
                }}
            />

            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-20 grid h-[68px] grid-cols-[96px_1fr_auto] border-b border-border-strong bg-background/52 lg:grid-cols-[128px_1fr_auto]">
                <Link
                    href="/landing"
                    className="flex items-center justify-center border-r border-border-strong font-mono text-[11px] font-bold uppercase tracking-[0.46em]"
                >
                    Komi
                </Link>

                <div className="flex items-center gap-6 px-8">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.36em] text-foreground/40">
                        碁の庭
                    </span>
                    <span className="hidden h-3 w-px bg-border-strong sm:block" />
                    <span className="hidden font-mono text-[9px] font-semibold uppercase tracking-[0.36em] text-foreground/40 sm:block">
                        Go learning system
                    </span>
                </div>

                <div className="flex h-full items-center border-l border-border-strong">
                    <Link
                        href="/auth/sign-in"
                        className="hidden h-full items-center px-6 font-mono text-[9px] font-semibold uppercase tracking-[0.36em] text-foreground/50 transition hover:text-foreground sm:flex"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/auth/sign-up"
                        className="flex h-full items-center border-l border-border-strong bg-foreground px-6 font-mono text-[9px] font-bold uppercase tracking-[0.36em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-8"
                    >
                        Start
                    </Link>
                </div>
            </header>

            {/* Ghost kanji — depth layer behind the text, not readable at a glance */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[2vw] top-[10vh] select-none font-mono text-[28vw] font-bold leading-none text-foreground/[0.038]"
            >
                形
            </div>

            {/* Hero — anchored upper-right, floating in the empty sky */}
            <div className="absolute right-[7vw] top-[18vh] z-10 text-right">

                {/* Live indicator */}
                <div className="mb-9 inline-flex items-center gap-2.5">
                    <span className="h-[5px] w-[5px] rounded-full bg-accent" />
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.46em] text-foreground/44">
                        v0.14 — Live board
                    </span>
                </div>

                {/* Headline — "Shape before" on one line, "strategy." below, intentionally heavy */}
                <h1 className="text-[clamp(5rem,10.8vw,12rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-foreground">
                    Shape<br />
                    <span className="text-foreground/55">before</span><br />
                    strategy.
                </h1>

                {/* Single-line descriptor — references visible mascots */}
                <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/42">
                    Kō & Moku guide you, stone by stone
                </p>

                {/* CTAs */}
                <div className="mt-9 flex items-center justify-end gap-2.5">
                    <Link
                        href="/auth/sign-up"
                        className="inline-flex h-10 items-center rounded-full bg-foreground px-6 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                        Begin lesson
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center rounded-full border border-border-strong px-6 font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-foreground/70 transition hover:border-foreground hover:text-foreground"
                    >
                        Open board
                    </Link>
                </div>
            </div>

            {/* Vertical edge label — echoes the reference images */}
            <p
                aria-hidden="true"
                className="absolute bottom-[12vh] right-6 z-10 select-none font-mono text-[8px] font-semibold uppercase tracking-[0.42em] text-foreground/24 [writing-mode:vertical-rl]"
            >
                Less noise — more signal
            </p>

            {/* Copyright — floating, no bar */}
            <p className="absolute bottom-6 right-7 z-10 font-mono text-[8px] font-semibold uppercase tracking-[0.34em] text-foreground/24">
                Komi © 2026
            </p>

        </main>
    )
}

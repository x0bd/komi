import Link from "next/link"

export default function LandingPage() {
    return (
        <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
            {/* Illustration — anchored bottom-left, bleeds into background */}
            <img
                src="/landing/komi-temple.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 h-[90%] w-auto select-none object-contain object-left-bottom"
            />

            {/* Blueprint grid overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.13]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgb(45 53 66 / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(45 53 66 / 0.6) 1px, transparent 1px)",
                    backgroundSize: "54px 54px",
                }}
            />

            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-20 grid h-[72px] grid-cols-[96px_1fr_auto] border-b border-border-strong bg-background/48 lg:grid-cols-[128px_1fr_auto]">
                <Link
                    href="/landing"
                    className="flex items-center justify-center border-r border-border-strong font-mono text-[12px] font-semibold uppercase tracking-[0.42em]"
                >
                    Komi
                </Link>

                <div className="flex items-center px-8">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                        対局 — Go learning system
                    </span>
                </div>

                <div className="flex h-full items-center border-l border-border-strong">
                    <Link
                        href="/auth/sign-in"
                        className="hidden h-full items-center px-7 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-muted-foreground transition hover:text-foreground sm:flex"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/auth/sign-up"
                        className="flex h-full items-center border-l border-border-strong bg-foreground px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-8"
                    >
                        Start
                    </Link>
                </div>
            </header>

            {/* Hero — floats in the upper-right sky */}
            <div className="absolute right-[7vw] top-1/2 z-10 -translate-y-[46%] text-right">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.44em] text-muted-foreground">
                    碁の庭 / v0.14
                </p>

                <div className="mb-5 ml-auto mt-5 h-px w-16 bg-accent" />

                <h1 className="text-[clamp(4.5rem,9.5vw,10rem)] font-semibold leading-[0.82] tracking-[-0.08em] text-foreground">
                    Learn<br />by shape.
                </h1>

                <div className="mt-10 flex items-center justify-end gap-3">
                    <Link
                        href="/auth/sign-up"
                        className="inline-flex h-11 items-center rounded-full bg-foreground px-7 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                        Begin lesson
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex h-11 items-center rounded-full border border-border-strong bg-background/30 px-7 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground transition hover:border-foreground"
                    >
                        Open board
                    </Link>
                </div>
            </div>

            {/* Footer strip */}
            <footer className="absolute inset-x-0 bottom-0 z-20 grid h-16 grid-cols-[96px_1fr_auto] border-t border-border-strong bg-background/48 lg:grid-cols-[128px_1fr_auto]">
                <div className="border-r border-border-strong" />
                <div className="flex items-center gap-4 overflow-hidden px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-muted-foreground sm:px-10">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="truncate">Shape first / mascot-led Go / Japanese technical garden</span>
                </div>
                <p className="hidden items-center border-l border-border-strong px-8 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-muted-foreground lg:flex">
                    Komi © 2026
                </p>
            </footer>
        </main>
    )
}

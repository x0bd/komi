"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuCircleUserRound, LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type DockPanel = {
    id: string;
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
};

export function GameLayout({
    board,
    panels = [],
    rightPanel,
    className,
}: {
    board: React.ReactNode;
    panels?: DockPanel[];
    rightPanel?: React.ReactNode;
    className?: string;
}) {
    const [activePanelId, setActivePanelId] = useState<string | null>(null);
    const activePanel = panels.find((p) => p.id === activePanelId);
    const isExpanded = Boolean(activePanel);

    useEffect(() => {
        if (!isExpanded) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActivePanelId(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isExpanded]);

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "relative h-svh overflow-hidden bg-background font-sans text-foreground",
                    className,
                )}
            >
                <header className="pointer-events-none absolute inset-x-0 top-0 z-50 grid h-14 grid-cols-[96px_1fr_auto] border-b border-border bg-background">
                    <div className="hidden border-r border-border px-5 py-4 lg:block">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                            KOMI
                        </span>
                    </div>
                    <div className="pointer-events-auto col-span-2 flex items-center gap-4 px-5 lg:col-span-1 lg:px-8">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            対局 / live board
                        </span>
                        <span className="hidden h-4 w-px bg-border md:block" />
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:inline">
                            lines over cards
                        </span>
                    </div>
                    <div className="pointer-events-auto hidden items-center border-l border-border px-6 sm:flex">
                        <Link
                            href="/games"
                            className="border border-border px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-subtle"
                        >
                            Record
                        </Link>
                    </div>
                </header>

                <div
                    className={cn(
                        "pointer-events-none relative z-10 flex h-svh w-full items-center justify-center px-4 pb-20 pt-14 transition-[padding] duration-300 ease-out lg:pb-4",
                        isExpanded ? "lg:pl-[584px]" : "lg:pl-[112px]",
                        rightPanel ? "lg:pr-36 xl:pr-48" : "lg:pr-8",
                    )}
                >
                    <main className="pointer-events-auto flex h-full min-h-0 w-full max-w-[46rem] items-center justify-center">
                        {board}
                    </main>

                    {rightPanel ? (
                        <aside className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col justify-center lg:flex xl:right-8">
                            {rightPanel}
                        </aside>
                    ) : null}
                </div>

                <aside
                    className={cn(
                        "pointer-events-auto fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:inset-x-auto lg:left-0 lg:top-14 lg:bottom-0 lg:border-r lg:border-t-0",
                        "transition-[width,height] duration-300 ease-out",
                        isExpanded
                            ? "h-[min(72svh,660px)] lg:h-auto lg:w-[528px]"
                            : "h-[68px] lg:h-auto lg:w-[96px]",
                    )}
                >
                    <div className="flex h-full min-h-0 flex-col lg:flex-row">
                        <nav className="relative flex h-[68px] w-full shrink-0 flex-row items-stretch overflow-hidden bg-background lg:h-full lg:w-[96px] lg:flex-col">
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -left-4 top-20 hidden select-none font-sans text-[8rem] font-semibold leading-none text-foreground/[0.08] lg:block"
                            >
                                碁
                            </span>

                            <div className="flex w-20 shrink-0 items-center border-r border-border px-4 lg:h-24 lg:w-full lg:border-b lg:border-r-0">
                                <div>
                                    <p className="font-sans text-base font-semibold tracking-[-0.055em] text-foreground">
                                        Komi
                                    </p>
                                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                                        対局
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-row lg:flex-col">
                                {panels.map((panel, index) => {
                                    const isActive = activePanelId === panel.id;

                                    return (
                                        <Tooltip key={panel.id}>
                                            <TooltipTrigger
                                                render={
                                                    <button
                                                        aria-label={panel.label}
                                                        aria-pressed={isActive}
                                                        onClick={() =>
                                                            setActivePanelId(
                                                                isActive
                                                                    ? null
                                                                    : panel.id,
                                                            )
                                                        }
                                                        className={cn(
                                                            "group relative flex h-full min-w-16 flex-1 items-center justify-center border-r border-border bg-background text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground lg:h-24 lg:w-full lg:min-w-0 lg:flex-none lg:border-b lg:border-r-0",
                                                            isActive &&
                                                                "bg-subtle text-foreground",
                                                        )}
                                                    />
                                                }
                                            >
                                                <span
                                                    className={cn(
                                                        "absolute inset-y-0 left-0 w-[3px] bg-transparent lg:inset-x-0 lg:top-0 lg:h-[3px] lg:w-auto",
                                                        isActive &&
                                                            "bg-accent",
                                                    )}
                                                />
                                                <span className="[&>svg]:size-5">
                                                    {panel.icon}
                                                </span>
                                                <span className="absolute right-2 top-2 font-mono text-[8px] text-muted-foreground">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                sideOffset={12}
                                                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                                            >
                                                {panel.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>

                            <div className="flex shrink-0 border-l border-border lg:border-l-0 lg:border-t">
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Link
                                                href="/profile"
                                                aria-label="Open profile"
                                                className="group relative flex h-full w-16 items-center justify-center bg-background text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground lg:h-20 lg:w-full"
                                            />
                                        }
                                    >
                                        <LuCircleUserRound className="size-5 transition-transform group-hover:scale-105" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        sideOffset={12}
                                        className="font-mono text-[10px] uppercase tracking-[0.16em]"
                                    >
                                        Profile
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </nav>

                        <section
                            className={cn(
                                "min-w-0 flex-1 border-border bg-background transition-[opacity,transform] duration-300 ease-out lg:border-l",
                                isExpanded
                                    ? "opacity-100 translate-y-0 lg:translate-x-0"
                                    : "pointer-events-none opacity-0 translate-y-4 lg:translate-x-4 lg:translate-y-0",
                            )}
                            aria-hidden={!isExpanded}
                        >
                            {activePanel ? (
                                <div className="flex h-full flex-col">
                                    <div className="grid grid-cols-[1fr_auto] border-b border-border">
                                        <div className="px-5 py-5 lg:px-7">
                                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                                active dossier
                                            </p>
                                            <h2 className="mt-1 truncate font-sans text-3xl font-semibold tracking-[-0.06em] text-foreground">
                                                {activePanel.label}
                                            </h2>
                                        </div>
                                        <button
                                            aria-label="Close panel"
                                            onClick={() => setActivePanelId(null)}
                                            className="flex aspect-square h-full min-h-16 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground focus:outline-none"
                                        >
                                            <LuX className="size-5" />
                                        </button>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-none lg:px-7 lg:py-6">
                                        <div className="mx-auto flex min-h-full w-full max-w-[30rem] flex-col">
                                            {activePanel.content}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </aside>
            </div>
        </TooltipProvider>
    );
}

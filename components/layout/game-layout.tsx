"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuUser, LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
                    "relative flex min-h-svh overflow-hidden bg-background font-sans text-foreground",
                    className,
                )}
            >
                <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-hairline bg-background/80 px-5 md:px-8">
                    <div className="pointer-events-auto flex items-center gap-4">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                            KOMI
                        </span>
                        <span className="hidden h-4 w-px bg-border md:block" />
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:inline">
                            対局 / live board
                        </span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                        <Button
                            render={<Link href="/games" />}
                            variant="outline"
                            size="sm"
                            className="hidden h-9 rounded-[6px] border-border bg-transparent px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-border-strong hover:bg-subtle/70 sm:inline-flex"
                        >
                            Record
                        </Button>
                    </div>
                </header>

                <div
                    className={cn(
                        "pointer-events-none relative z-10 mx-auto flex h-svh w-full flex-1 items-center justify-center px-5 pb-28 pt-16 transition-[padding] duration-300 ease-out lg:pb-8",
                        isExpanded ? "lg:pl-[660px]" : "lg:pl-[144px]",
                        rightPanel ? "lg:pr-36 xl:pr-48" : "lg:pr-8",
                    )}
                >
                    <main className="pointer-events-auto flex h-full w-full max-w-2xl items-center justify-center 2xl:max-w-3xl">
                        {board}
                    </main>

                    {rightPanel ? (
                        <aside className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col justify-center lg:flex xl:right-8">
                            {rightPanel}
                        </aside>
                    ) : null}
                </div>

                <div
                    className={cn(
                        "pointer-events-auto fixed inset-x-3 bottom-3 z-40 lg:inset-x-auto lg:left-4 lg:top-20 lg:bottom-4",
                        "transition-[width,height] duration-300 ease-out",
                        isExpanded
                            ? "h-[min(74svh,650px)] lg:h-auto lg:w-[min(620px,calc(100vw-2rem))]"
                            : "h-[76px] lg:h-auto lg:w-[92px]",
                    )}
                >
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-card text-foreground lg:flex-row">
                        <nav className="relative flex h-[76px] w-full shrink-0 flex-row items-center gap-2 overflow-hidden border-b border-border bg-background/45 px-3 py-2 lg:h-full lg:w-[92px] lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-5">
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -left-3 top-20 hidden select-none font-sans text-[7rem] font-semibold leading-none text-foreground/[0.08] lg:block"
                            >
                                碁
                            </span>

                            <div className="mr-2 flex items-center justify-center lg:mr-0 lg:h-20 lg:w-full">
                                <div className="flex flex-col items-start leading-none lg:items-center">
                                    <span className="font-sans text-base font-semibold tracking-[-0.04em] text-foreground lg:text-lg">
                                        Komi
                                    </span>
                                    <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                                        対局
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-row items-center justify-center gap-2 lg:mt-5 lg:w-full lg:flex-col lg:gap-3 lg:px-3">
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
                                                            "group relative flex size-12 items-center justify-center rounded-[10px] border transition-[background-color,border-color,color,transform] duration-150 lg:w-full",
                                                            isActive
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : "border-transparent text-muted-foreground hover:border-border-strong hover:bg-subtle/70 hover:text-foreground",
                                                        )}
                                                    />
                                                }
                                            >
                                                <span className="[&>svg]:size-5">
                                                    {panel.icon}
                                                </span>
                                                <span className="absolute -right-1 -top-1 hidden rounded-full border border-border bg-card px-1 font-mono text-[8px] text-muted-foreground lg:block">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                sideOffset={14}
                                                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                                            >
                                                {panel.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>

                            <div className="ml-2 flex items-center gap-3 lg:ml-0 lg:mt-auto lg:w-full lg:flex-col lg:px-3">
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Link
                                                href="/profile"
                                                aria-label="Open profile"
                                                className="relative flex size-12 items-center justify-center rounded-[10px] border border-transparent text-muted-foreground transition-[background-color,border-color,color] duration-150 hover:border-border-strong hover:bg-subtle/70 hover:text-foreground lg:w-full"
                                            />
                                        }
                                    >
                                        <LuUser className="size-5" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        sideOffset={14}
                                        className="font-mono text-[10px] uppercase tracking-[0.16em]"
                                    >
                                        Profile
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <span className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl] lg:block">
                                match rail
                            </span>
                        </nav>

                        <section
                            className={cn(
                                "relative min-w-0 flex-1 border-border transition-[opacity,transform] duration-300 ease-out lg:border-l-0",
                                isExpanded
                                    ? "opacity-100 translate-y-0 lg:translate-x-0"
                                    : "pointer-events-none opacity-0 translate-y-4 lg:translate-x-4 lg:translate-y-0",
                            )}
                            aria-hidden={!isExpanded}
                        >
                            {activePanel ? (
                                <div className="flex h-full flex-col bg-card text-foreground">
                                    <div className="flex items-center justify-between gap-4 border-b border-border bg-background/35 px-4 py-4 lg:px-7 lg:py-5">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-subtle text-foreground [&>svg]:size-5">
                                                {activePanel.icon}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                    active dossier
                                                </p>
                                                <h2 className="truncate font-sans text-2xl font-semibold tracking-[-0.055em] text-foreground lg:text-3xl">
                                                    {activePanel.label}
                                                </h2>
                                            </div>
                                        </div>
                                        <button
                                            aria-label="Close panel"
                                            onClick={() => setActivePanelId(null)}
                                            className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-border bg-transparent text-muted-foreground transition-[background-color,border-color,color] duration-150 hover:border-border-strong hover:bg-subtle/70 hover:text-foreground focus:outline-none"
                                        >
                                            <LuX className="size-5" />
                                        </button>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 scrollbar-none lg:px-7 lg:py-6">
                                        <div className="mx-auto flex min-h-full w-full max-w-[30rem] flex-col">
                                            {activePanel.content}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

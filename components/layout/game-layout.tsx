"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LuX, LuUser } from "react-icons/lu";

export type DockPanel = {
    id: string;
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
};

export function GameLayout({
    board,
    panels = [],
    className,
}: {
    board: React.ReactNode;
    panels?: DockPanel[];
    className?: string;
}) {
    const [activePanelId, setActivePanelId] = useState<string | null>(null);
    const activePanel = panels.find((p) => p.id === activePanelId);
    const isExpanded = Boolean(activePanel);

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "relative flex min-h-svh overflow-hidden bg-background text-foreground font-sans",
                    className,
                )}
            >
                <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-end px-6 py-4 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <Button
                            render={<Link href="/games" />}
                            variant="ghost"
                            size="sm"
                            className="rounded-full hidden sm:inline-flex"
                        >
                            History
                        </Button>
                        <ThemeToggle className="rounded-full" />
                    </div>
                </header>

                {/* Main Workspace */}
                <div className="relative z-10 flex flex-1 w-full mx-auto px-24 lg:px-32 h-svh">
                    {/* Board Area */}
                    <main className="flex flex-1 items-center justify-center h-full">
                        <div className="w-full flex justify-center max-w-3xl">
                            {board}
                        </div>
                    </main>
                </div>

                {/* Left Dock */}
                <div
                    className={cn(
                        "fixed left-3 top-3 bottom-3 z-40 pointer-events-auto lg:left-4 lg:top-4 lg:bottom-4",
                        "transition-[width] duration-300 ease-out",
                        isExpanded
                            ? "w-[min(560px,calc(100vw-1.5rem))] lg:w-[min(620px,calc(100vw-2rem))]"
                            : "w-[68px] lg:w-[76px]",
                    )}
                >
                    <div className="relative flex h-full overflow-hidden rounded-none border-2 border-border bg-card shadow-[4px_4px_0_0_var(--foreground)]">
                        <nav className="relative flex h-full w-[68px] shrink-0 flex-col items-center gap-2 border-r border-border/60 py-6 lg:w-[76px]">
                            <div className="flex items-center justify-center mb-6 mt-1.5">
                                <span className="font-display text-2xl font-black tracking-tighter uppercase text-foreground select-none">
                                    Komi
                                </span>
                            </div>

                            <div className="flex flex-1 flex-col items-center gap-3 w-full px-3">
                                {panels.map((panel) => {
                                    const isActive = activePanelId === panel.id;
                                    return (
                                        <Tooltip key={panel.id}>
                                            <TooltipTrigger
                                                render={
                                                    <button
                                                        onClick={() => setActivePanelId(isActive ? null : panel.id)}
                                                        className={cn(
                                                            "relative flex min-h-12 w-full items-center justify-center rounded-none transition-all duration-200 group border border-transparent",
                                                            isActive
                                                                ? "bg-foreground text-primary-foreground border-border"
                                                                : "text-muted-foreground hover:bg-foreground hover:text-primary-foreground",
                                                        )}
                                                    />
                                                }
                                            >
                                                <span className="[&>svg]:size-5">{panel.icon}</span>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" sideOffset={16} className="font-semibold text-xs tracking-wide">
                                                {panel.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>

                            <div className="mt-auto flex flex-col items-center gap-3 w-full px-3">
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Link
                                                href="/profile"
                                                className="relative flex min-h-12 w-full items-center justify-center rounded-2xl transition-all duration-200 group text-muted-foreground hover:bg-foreground/5 dark:hover:bg-secondary/80 hover:text-foreground"
                                            />
                                        }
                                    >
                                        <LuUser className="size-5" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={16} className="font-semibold text-xs tracking-wide">
                                        Profile
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </nav>

                        <div
                            className={cn(
                                "relative min-w-0 flex-1 transition-[opacity,transform] duration-250 ease-out",
                                isExpanded ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-4",
                            )}
                            aria-hidden={!isExpanded}
                        >
                            {activePanel ? (
                                <div className="flex h-full flex-col bg-swiss-red dark:bg-card/90">
                                    <div className="flex items-center justify-between gap-4 border-b-2 border-border px-6 py-5 lg:px-7 bg-card">
                                        <h2 className="flex items-center gap-3 font-display font-black text-2xl tracking-tighter text-foreground uppercase">
                                            <span className="flex size-10 items-center justify-center rounded-none border-2 border-border bg-foreground text-card [&>svg]:size-5">
                                                {activePanel.icon}
                                            </span>
                                            <span>{activePanel.label}</span>
                                        </h2>
                                        <button
                                            onClick={() => setActivePanelId(null)}
                                            className="flex size-11 items-center justify-center rounded-none border-2 border-transparent text-muted-foreground transition-all hover:border-border hover:bg-foreground hover:text-primary-foreground focus:outline-none"
                                        >
                                            <LuX className="size-6" />
                                        </button>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-7 scrollbar-none">
                                        <div className="mx-auto flex min-h-full w-full max-w-[30rem] flex-col">
                                            {activePanel.content}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
                    "relative flex min-h-svh overflow-hidden bg-background text-foreground font-sans",
                    className,
                )}
            >
                <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-end px-6 py-4 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <Button
                            render={<Link href="/games" />}
                            variant="outline"
                            size="sm"
                            className="rounded-none hidden sm:inline-flex border-2 border-black bg-white text-black hover:bg-black hover:text-white font-mono font-bold tracking-widest uppercase text-xs px-6 py-5 shadow-[4px_4px_0_0_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            History
                        </Button>
                    </div>
                </header>

                {/* Main Workspace */}
                <div
                    className={cn(
                        "relative z-10 flex flex-1 w-full mx-auto h-svh items-center justify-center px-6 pb-24 pointer-events-none transition-[padding] duration-300 ease-out lg:pb-0",
                        isExpanded ? "lg:pl-[680px]" : "lg:pl-32",
                        rightPanel ? "lg:pr-40 xl:pr-56" : "lg:pr-6",
                    )}
                >
                    {/* Board Area */}
                    <main className="flex items-center justify-center h-full pointer-events-auto max-w-2xl 2xl:max-w-3xl w-full">
                        {board}
                    </main>

                    {/* Right Floating Dashboard */}
                    {rightPanel && (
                        <aside className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0 pointer-events-auto flex flex-col justify-center px-4 md:px-8 lg:px-12 xl:px-16">
                            {rightPanel}
                        </aside>
                    )}
                </div>

                {/* Left Dock */}
                <div
                    className={cn(
                        "fixed inset-x-3 bottom-3 z-40 pointer-events-auto lg:inset-x-auto lg:left-4 lg:top-4 lg:bottom-4",
                        "transition-[width,height] duration-300 ease-out",
                        isExpanded
                            ? "h-[min(76svh,640px)] lg:h-auto lg:w-[min(620px,calc(100vw-2rem))]"
                            : "h-[72px] lg:h-auto lg:w-[76px]",
                    )}
                >
                    <div className="relative flex h-full flex-col overflow-hidden rounded-none border-2 border-border bg-black shadow-[4px_4px_0_0_var(--foreground)] text-white lg:flex-row">
                        <nav className="relative flex h-[72px] w-full shrink-0 flex-row items-center gap-2 border-b border-white/20 px-3 py-2 lg:h-full lg:w-[76px] lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-6">
                            <div className="mr-2 flex items-center justify-center lg:mb-8 lg:mr-0 lg:mt-4">
                                <span className="font-display text-lg font-black tracking-tighter uppercase text-white select-none lg:text-2xl">
                                    Komi
                                </span>
                            </div>

                            <div className="flex flex-1 flex-row items-center justify-center gap-2 lg:mt-4 lg:w-full lg:flex-col lg:gap-6 lg:px-3">
                                {panels.map((panel) => {
                                    const isActive = activePanelId === panel.id;
                                    return (
                                        <Tooltip key={panel.id}>
                                            <TooltipTrigger
                                                render={
                                                    <button
                                                        aria-label={panel.label}
                                                        aria-pressed={isActive}
                                                        onClick={() => setActivePanelId(isActive ? null : panel.id)}
                                                        className={cn(
                                                            "relative flex size-12 items-center justify-center rounded-none transition-all duration-200 group border border-transparent lg:w-full",
                                                            isActive
                                                                ? "bg-white text-black border-white"
                                                                : "text-white/50 hover:bg-white hover:text-black",
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

                            <div className="ml-2 flex items-center gap-3 lg:mt-auto lg:ml-0 lg:w-full lg:flex-col lg:px-3">
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Link
                                                href="/profile"
                                                aria-label="Open profile"
                                                className="relative flex size-12 items-center justify-center rounded-none transition-all duration-200 group text-white/50 hover:bg-white hover:text-black lg:w-full"
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
                                isExpanded ? "opacity-100 translate-y-0 lg:translate-x-0" : "pointer-events-none opacity-0 translate-y-4 lg:translate-x-4 lg:translate-y-0",
                            )}
                            aria-hidden={!isExpanded}
                        >
                            {activePanel ? (
                                <div className="flex h-full flex-col bg-black text-white">
                                    <div className="flex items-center justify-between gap-4 border-b-2 border-white/20 bg-black px-4 py-4 lg:px-7 lg:py-5">
                                        <h2 className="flex items-center gap-3 font-display font-black text-xl tracking-tighter text-white uppercase lg:text-2xl">
                                            <span className="flex size-9 items-center justify-center rounded-none border-2 border-border bg-foreground text-card [&>svg]:size-4 lg:size-10 lg:[&>svg]:size-5">
                                                {activePanel.icon}
                                            </span>
                                            <span>{activePanel.label}</span>
                                        </h2>
                                        <button
                                            aria-label="Close panel"
                                            onClick={() => setActivePanelId(null)}
                                            className="flex size-11 items-center justify-center rounded-none border-2 border-transparent text-muted-foreground transition-all hover:border-border hover:bg-foreground hover:text-primary-foreground focus:outline-none"
                                        >
                                            <LuX className="size-6" />
                                        </button>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-7 scrollbar-none">
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

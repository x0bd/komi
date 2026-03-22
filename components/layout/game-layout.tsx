"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LuX } from "react-icons/lu";

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

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "relative flex min-h-svh overflow-hidden bg-background text-foreground font-sans",
                    className,
                )}
            >
                {/* Minimalist Header */}
                <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <span className="font-sans text-lg font-bold tracking-tight text-foreground select-none">
                            Komi
                        </span>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto mr-16">
                        <Button
                            render={<Link href="/games" />}
                            variant="ghost"
                            size="sm"
                            className="rounded-full hidden sm:inline-flex"
                        >
                            History
                        </Button>
                        <Button
                            render={<Link href="/profile" />}
                            variant="ghost"
                            size="sm"
                            className="rounded-full hidden sm:inline-flex"
                        >
                            Profile
                        </Button>
                        <ThemeToggle className="rounded-full" />
                    </div>
                </header>

                {/* Main Workspace */}
                <div className="relative z-10 flex flex-1 w-full mx-auto pt-20 pb-0 pl-4 pr-16 lg:pr-20 h-svh">
                    {/* Board Area */}
                    <main className="flex flex-1 items-center justify-center h-full">
                        <div className="w-full flex justify-center max-w-3xl">
                            {board}
                        </div>
                    </main>
                </div>

                {/* Right Dock */}
                <nav className="fixed right-0 top-0 bottom-0 z-40 w-16 lg:w-20 border-l border-border/50 bg-background/80 backdrop-blur-xl flex flex-col items-center py-6 gap-4 pointer-events-auto">
                    <div className="flex-1 flex flex-col items-center gap-4 mt-16">
                        {panels.map((panel) => {
                            const isActive = activePanelId === panel.id;
                            return (
                                <Tooltip key={panel.id} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setActivePanelId(isActive ? null : panel.id)}
                                            className={cn(
                                                "relative flex size-12 items-center justify-center rounded-2xl transition-all duration-200",
                                                isActive 
                                                    ? "bg-foreground text-background shadow-md scale-105" 
                                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <span className="[&>svg]:size-5">{panel.icon}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" sideOffset={12}>
                                        {panel.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </nav>

                {/* Modals Attached to the Left of the Dock */}
                {activePanel && (
                    <div 
                        className="fixed right-16 lg:right-20 top-0 bottom-0 z-50 w-[420px] max-w-[calc(100vw-4rem)] border-l border-border/50 bg-card/95 backdrop-blur-2xl shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)] animate-in slide-in-from-right-4 duration-300 flex flex-col pointer-events-auto"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <span className="[&>svg]:size-5 text-muted-foreground">{activePanel.icon}</span>
                                {activePanel.label}
                            </h2>
                            <button 
                                onClick={() => setActivePanelId(null)}
                                className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                            >
                                <LuX className="size-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-none">
                            {activePanel.content}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

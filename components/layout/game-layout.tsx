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
                <div className="relative z-10 flex flex-1 w-full mx-auto pt-20 pb-0 pl-24 lg:pl-32 pr-4 lg:pr-6 h-svh">
                    {/* Board Area */}
                    <main className="flex flex-1 items-center justify-center h-full">
                        <div className="w-full flex justify-center max-w-3xl">
                            {board}
                        </div>
                    </main>
                </div>

                {/* Left Dock */}
                <nav className="fixed left-3 lg:left-4 top-3 lg:top-4 bottom-3 lg:bottom-4 z-40 w-[68px] lg:w-[76px] rounded-[2rem] border border-border/80 bg-foreground/[0.03] dark:bg-card/95 backdrop-blur-2xl shadow-xl flex flex-col items-center py-6 gap-2 pointer-events-auto">
                    <div className="flex items-center justify-center mb-6 mt-1.5">
                        <span className="font-sans text-[15px] font-bold tracking-tight text-foreground select-none">
                            Komi
                        </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center gap-3 w-full px-3">
                        {panels.map((panel) => {
                            const isActive = activePanelId === panel.id;
                            return (
                                <Tooltip key={panel.id}>
                                    <TooltipTrigger
                                        render={
                                            <button
                                                onClick={() => setActivePanelId(isActive ? null : panel.id)}
                                                className={cn(
                                                    "relative flex min-h-12 w-full items-center justify-center rounded-2xl transition-all duration-200 group",
                                                    isActive 
                                                        ? "bg-foreground/10 dark:bg-accent/20 text-foreground shadow-sm" 
                                                        : "text-muted-foreground hover:bg-foreground/5 dark:hover:bg-secondary/80 hover:text-foreground"
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

                {/* Modals Attached to the Right of the Left Dock */}
                {activePanel && (
                    <div
                        className="fixed left-[84px] lg:left-[96px] top-3 lg:top-4 bottom-3 lg:bottom-4 z-50 w-[420px] max-w-[calc(100vw-[80px]-1rem)] rounded-[1.5rem] border border-border/60 bg-card shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col pointer-events-auto overflow-hidden"
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

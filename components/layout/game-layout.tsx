"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function GameLayout({
    board,
    sidebar,
    className,
}: {
    board: React.ReactNode;
    sidebar: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative flex min-h-svh flex-col overflow-hidden bg-background",
                className,
            )}
        >
            {/* Dynamic Island style topbar */}
            <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-center pt-4 lg:pt-6">
                <div className="pointer-events-auto flex items-center gap-2 lg:gap-4 rounded-full border border-border/50 bg-background/80 px-4 py-2 shadow-sm backdrop-blur-xl">
                    <span className="font-display text-sm font-bold tracking-[0.12em] text-foreground select-none uppercase mr-2">
                        Komi
                    </span>
                    <div className="h-4 w-px bg-border/50 hidden sm:block" />
                    <Button
                        render={<Link href="/games" />}
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 px-3 hidden sm:inline-flex"
                    >
                        Games
                    </Button>
                    <Button
                        render={<Link href="/profile" />}
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 px-3 hidden sm:inline-flex"
                    >
                        Profile
                    </Button>
                    <div className="h-4 w-px bg-border/50 mx-1" />
                    <ThemeToggle className="pointer-events-auto h-8 w-8 rounded-full [&_svg]:size-4" />
                </div>
            </header>

            {/* Main area */}
            <div className="relative z-10 flex flex-1 w-full max-w-[1600px] mx-auto pt-24 pb-6 px-4 lg:px-8">
                <div className="flex w-full gap-8 max-lg:flex-col lg:items-start h-full">
                    {/* Board — takes remaining space, centered */}
                    <main className="flex flex-1 items-center justify-center min-h-[50vh] lg:min-h-[calc(100svh-8rem)]">
                        <div className="w-full flex justify-center">
                            {board}
                        </div>
                    </main>

                    {/* Sidebar — floating inspector panel */}
                    <aside className="relative z-20 w-full lg:w-[400px] lg:min-w-[360px] shrink-0 pb-24 lg:pb-0">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-5 rounded-2xl lg:border lg:border-border/40 lg:bg-card/30 lg:p-5 lg:shadow-2xl lg:backdrop-blur-2xl lg:max-h-[calc(100svh-8rem)] overflow-y-auto scrollbar-none">
                            {sidebar}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

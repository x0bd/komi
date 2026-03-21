"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LuMenu } from "react-icons/lu";

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
                "relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground font-sans",
                className,
            )}
        >
            {/* Minimalist Header */}
            <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <span className="font-sans text-lg font-bold tracking-tight text-foreground select-none">
                        Komi
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        render={<Link href="/games" />}
                        variant="ghost"
                        size="sm"
                        className="rounded-full hidden sm:inline-flex"
                    >
                        Games
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
            <div className="relative z-10 flex flex-1 w-full mx-auto pt-20 pb-0 px-4 lg:px-6">
                <div className="flex w-full gap-6 max-lg:flex-col lg:items-center h-full max-w-[1600px] mx-auto">
                    {/* Board Area */}
                    <main className="flex flex-1 items-center justify-center min-h-[50vh] lg:min-h-[calc(100svh-5rem)]">
                        <div className="w-full flex justify-center max-w-3xl">
                            {board}
                        </div>
                    </main>

                    {/* Sidebar Area — Unified Apple-style Frosted Panel */}
                    <aside className="relative z-20 w-full lg:w-[420px] shrink-0 pb-12 lg:pb-0 h-full flex flex-col justify-center">
                        <div className="flex flex-col w-full h-[calc(100svh-8rem)]">
                            {sidebar}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

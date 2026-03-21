"use client";

import { cn } from "@/lib/utils";
import type { AIDifficulty } from "@/lib/stores/game-store";

const OPTIONS: Array<{
    value: AIDifficulty;
    label: string;
    enabled: boolean;
}> = [
    { value: "easy", label: "Easy", enabled: true },
    { value: "medium", label: "Medium", enabled: true },
    { value: "hard", label: "Hard", enabled: true },
];

export function AIDifficultySelector({
    value = "easy",
    onValueChange,
    className,
}: {
    value?: AIDifficulty;
    onValueChange?: (value: AIDifficulty) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-[1.75rem] border border-border/60 bg-white dark:bg-card/60 shadow-sm p-5",
                className,
            )}
        >
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                AI DIFFICULTY
            </p>
            <div className="flex items-center justify-between gap-4">
                <p className="font-sans text-[15px] font-semibold text-foreground leading-tight max-w-[100px]">
                    Train against Sensei
                </p>

                <div className="flex bg-[#f0eee9] dark:bg-secondary/40 rounded-full p-1 border border-border/40">
                    {OPTIONS.map((option) => {
                        const active = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={!option.enabled}
                                onClick={() => {
                                    if (option.enabled) {
                                        onValueChange?.(option.value);
                                    }
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[13px] font-sans font-medium transition-all duration-200",
                                    active
                                        ? "bg-[#1f1d1a] dark:bg-foreground text-white dark:text-background shadow-md"
                                        : "text-muted-foreground",
                                    option.enabled && !active
                                        ? "hover:text-foreground"
                                        : "",
                                    !option.enabled &&
                                        "cursor-not-allowed opacity-45",
                                )}
                                aria-pressed={active}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

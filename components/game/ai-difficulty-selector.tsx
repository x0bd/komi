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
    const descMap: Record<AIDifficulty, string> = {
        easy: "Gentle guidance for beginners",
        medium: "Tactical play, room for growth",
        hard: "Advanced moves, maximum challenge",
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-5 rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-xl shadow-sm p-6",
                className,
            )}
        >
            <div className="flex flex-col gap-1 px-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    AI Engine · Sensei
                </span>
                <p className="font-sans text-[15px] font-semibold text-foreground leading-tight">
                    {descMap[value ?? "easy"]}
                </p>
            </div>

            <div className="flex bg-background/70 dark:bg-secondary/40 rounded-full p-1.5 border border-border/50 shadow-inner">
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
                                "flex-1 px-3 py-2 rounded-full text-[13px] font-sans font-bold tracking-wide transition-all duration-300",
                                active
                                    ? "bg-foreground text-background shadow-md scale-[1.02]"
                                    : "text-muted-foreground hover:text-foreground",
                                !option.enabled && "cursor-not-allowed opacity-40",
                            )}
                            aria-pressed={active}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

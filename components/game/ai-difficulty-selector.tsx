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
                "flex flex-col border border-border bg-background",
                className,
            )}
        >
            <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    AI Engine / Sensei
                </span>
                <p className="font-sans text-[15px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                    {descMap[value ?? "easy"]}
                </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border">
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
                                "px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                                active
                                    ? "bg-foreground text-primary-foreground"
                                    : "text-muted-foreground hover:bg-subtle hover:text-foreground",
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

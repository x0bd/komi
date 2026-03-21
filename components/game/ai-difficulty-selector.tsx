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
                "overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm p-4",
                className,
            )}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Sensei Engine
                        </p>
                        <p className="font-sans text-[13px] font-medium text-foreground">
                            Choose difficulty level
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary/40 p-1">
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
                                    "h-8 rounded-lg text-[13px] font-sans font-medium transition-all duration-200",
                                    active
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground",
                                    option.enabled
                                        ? "hover:text-foreground"
                                        : "cursor-not-allowed opacity-45",
                                )}
                                aria-pressed={active}
                                aria-label={
                                    option.enabled
                                        ? `${option.label} difficulty`
                                        : `${option.label} difficulty coming soon`
                                }
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

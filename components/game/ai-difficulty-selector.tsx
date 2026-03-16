"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AIDifficulty } from "@/lib/stores/game-store";

const OPTIONS: Array<{
    value: AIDifficulty;
    label: string;
    enabled: boolean;
}> = [
    { value: "easy", label: "Easy", enabled: true },
    { value: "medium", label: "Medium", enabled: false },
    { value: "hard", label: "Hard", enabled: false },
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
        <Card
            className={cn(
                "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md",
                className,
            )}
        >
            <CardContent className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        AI Difficulty
                    </p>
                    <p className="mt-0.5 font-display text-sm font-semibold text-foreground">
                        Train against Sensei
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-1 rounded-full border border-border/70 bg-secondary p-1">
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
                                    "min-h-9 min-w-[4.4rem] rounded-full px-3 text-sm font-display font-semibold transition-all duration-200",
                                    active
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground",
                                    option.enabled
                                        ? "hover:bg-background/80 hover:text-foreground"
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
            </CardContent>
        </Card>
    );
}

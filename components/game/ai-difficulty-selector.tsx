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
                "flex flex-col gap-5 rounded-none border-[3px] border-white bg-white shadow-[6px_6px_0_0_var(--swiss-blue)] p-6",
                className,
            )}
        >
            <div className="flex flex-col gap-1 px-1">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-black/50">
                    AI Engine · Sensei
                </span>
                <p className="font-sans text-[15px] font-black text-black leading-tight">
                    {descMap[value ?? "easy"]}
                </p>
            </div>

            <div className="flex bg-black rounded-none p-[3px] border-[3px] border-black">
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
                                "flex-1 px-3 py-2 rounded-none text-[13px] font-mono font-black tracking-wide uppercase transition-all duration-300 border border-transparent",
                                active
                                    ? "bg-white text-black border-black/20 shadow-[2px_2px_0_0_var(--swiss-red)]"
                                    : "text-white/50 hover:text-white",
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

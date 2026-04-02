"use client";

import {
    LuPause,
    LuPlay,
    LuSkipBack,
    LuSkipForward,
    LuStepBack,
    LuStepForward,
} from "react-icons/lu";

type ReplayControlsProps = {
    maxMove: number;
    currentMove: number;
    isPlaying: boolean;
    playbackSpeed: number;
    onTogglePlay: () => void;
    onSeek: (moveNumber: number) => void;
    onStepBack: () => void;
    onStepForward: () => void;
    onSkipStart: () => void;
    onSkipEnd: () => void;
    onSpeedChange: (speed: number) => void;
};

export function ReplayControls({
    maxMove,
    currentMove,
    isPlaying,
    playbackSpeed,
    onTogglePlay,
    onSeek,
    onStepBack,
    onStepForward,
    onSkipStart,
    onSkipEnd,
    onSpeedChange,
}: ReplayControlsProps) {
    return (
        <div className="rounded-none border-2 border-border bg-card p-4 shadow-[4px_4px_0_0_var(--foreground)]">
            <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Replay
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                    {currentMove}/{maxMove}
                </p>
            </div>

            <input
                type="range"
                min={0}
                max={Math.max(0, maxMove)}
                value={Math.max(0, Math.min(currentMove, maxMove))}
                onChange={(event) =>
                    onSeek(Number.parseInt(event.target.value, 10) || 0)
                }
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-none border border-border bg-background"
            />

            <div className="mt-3 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={onSkipStart}
                    className="inline-flex size-8 items-center justify-center rounded-none border-2 border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label="Skip to start"
                >
                    <LuSkipBack className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onStepBack}
                    className="inline-flex size-8 items-center justify-center rounded-none border-2 border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label="Step backward"
                >
                    <LuStepBack className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onTogglePlay}
                    className="inline-flex size-9 items-center justify-center rounded-none border-2 border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label={isPlaying ? "Pause replay" : "Play replay"}
                >
                    {isPlaying ? (
                        <LuPause className="size-4" />
                    ) : (
                        <LuPlay className="size-4" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onStepForward}
                    className="inline-flex size-8 items-center justify-center rounded-none border-2 border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label="Step forward"
                >
                    <LuStepForward className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onSkipEnd}
                    className="inline-flex size-8 items-center justify-center rounded-none border-2 border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    aria-label="Skip to end"
                >
                    <LuSkipForward className="size-4" />
                </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">Speed</p>
                <select
                    value={String(playbackSpeed)}
                    onChange={(event) =>
                        onSpeedChange(Number.parseFloat(event.target.value) || 1)
                    }
                    className="h-8 rounded-none border-2 border-border bg-background px-2.5 font-mono text-xs font-bold text-foreground shadow-[2px_2px_0_0_var(--foreground)] cursor-pointer"
                >
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        </div>
    );
}

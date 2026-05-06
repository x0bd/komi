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
        <div className="border border-border bg-background">
            <div className="flex items-center justify-between gap-3">
                <p className="border-r border-border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Replay
                </p>
                <p className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {currentMove}/{maxMove}
                </p>
            </div>

            <div className="border-t border-border px-3 py-3">
                <input
                    type="range"
                    min={0}
                    max={Math.max(0, maxMove)}
                    value={Math.max(0, Math.min(currentMove, maxMove))}
                    onChange={(event) =>
                        onSeek(Number.parseInt(event.target.value, 10) || 0)
                    }
                    className="h-2 w-full cursor-pointer appearance-none border border-border bg-background"
                />
            </div>

            <div className="grid grid-cols-5 border-y border-border">
                <button
                    type="button"
                    onClick={onSkipStart}
                    className="inline-flex h-10 items-center justify-center border-r border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                    aria-label="Skip to start"
                >
                    <LuSkipBack className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onStepBack}
                    className="inline-flex h-10 items-center justify-center border-r border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                    aria-label="Step backward"
                >
                    <LuStepBack className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onTogglePlay}
                    className="inline-flex h-10 items-center justify-center border-r border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
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
                    className="inline-flex h-10 items-center justify-center border-r border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                    aria-label="Step forward"
                >
                    <LuStepForward className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onSkipEnd}
                    className="inline-flex h-10 items-center justify-center bg-background text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
                    aria-label="Skip to end"
                >
                    <LuSkipForward className="size-4" />
                </button>
            </div>

            <div className="flex items-center justify-between px-3 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Speed
                </p>
                <select
                    value={String(playbackSpeed)}
                    onChange={(event) =>
                        onSpeedChange(Number.parseFloat(event.target.value) || 1)
                    }
                    className="h-8 cursor-pointer border border-border bg-background px-2.5 font-mono text-xs font-semibold text-foreground"
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

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    LuChevronDown,
    LuChevronUp,
    LuHistory,
    LuSparkles,
} from "react-icons/lu";

export type MoveEntry = {
    moveNumber: number;
    player: "black" | "white";
    coordinate?: string;
    isPass?: boolean;
};

export function MoveHistory({
    moves,
    moveCount = 0,
    variant = "default",
    collapsed = false,
    highlightedMoveNumber,
    onMoveSelect,
    onToggle,
    className,
}: {
    moves: MoveEntry[];
    moveCount?: number;
    variant?: "default" | "embedded";
    collapsed?: boolean;
    highlightedMoveNumber?: number;
    onMoveSelect?: (moveNumber: number) => void;
    onToggle?: () => void;
    className?: string;
}) {
    const isEmbedded = variant === "embedded";
    const hasMoves = moves.length > 0;
    const lastMove = hasMoves ? moves[moves.length - 1] : null;
    const summaryText = lastMove
        ? lastMove.isPass
            ? `Last move: ${lastMove.player === "black" ? "Black" : "White"} passed`
            : `Last move: ${lastMove.coordinate ?? "—"}`
        : "Opening ready";

    if (collapsed && !isEmbedded) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg mt-2"
            >
                <div className="px-2 py-3 flex items-center justify-between border-t-2 border-t-border transition-colors hover:bg-foreground hover:text-primary-foreground rounded-none group-focus-visible:border-border">
                    <div className="flex items-center gap-3 min-w-0">
                        <LuHistory className="size-4 opacity-70" />
                        <div className="min-w-0">
                            <p className="font-mono text-[13px] font-bold uppercase tracking-widest text-inherit">
                                History
                            </p>
                            <p className="truncate text-[11px] opacity-70 font-sans">
                                {summaryText}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-70">
                        <span className="font-mono text-[10px] border border-inherit px-2 py-0.5 rounded-none">
                            {moveCount}
                        </span>
                        <LuChevronDown className="size-4" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col overflow-hidden transition-all duration-300 mt-2",
                !isEmbedded && "border-t border-border/50",
                className,
            )}
        >
            {!isEmbedded && (
                <div className="shrink-0 px-2 pb-2 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <LuHistory className="size-4 text-foreground/70" />
                        <span className="font-sans text-sm font-semibold text-foreground">
                            Replay Log
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-mono text-[10px] border border-border px-2 py-0.5 rounded-none">
                            {moveCount}
                        </span>
                        {onToggle && (
                            <button
                                type="button"
                                onClick={onToggle}
                                aria-label="Collapse history"
                                className="flex size-6 items-center justify-center rounded-none border border-transparent transition-colors hover:border-border hover:bg-foreground hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <LuChevronUp className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={cn("min-h-0 flex-1 p-0", !isEmbedded && "pt-0")}>
                <ScrollArea
                    className={cn(
                        isEmbedded
                            ? "h-[min(55vh,380px)]"
                            : "h-[200px] lg:h-full lg:min-h-[260px]",
                    )}
                >
                    <div
                        className={cn(
                            "flex flex-col gap-1",
                            isEmbedded ? "px-4 pb-6 pt-4" : "p-2",
                        )}
                    >
                        {hasMoves ? (
                            moves.map((m) => (
                                <button
                                    key={m.moveNumber}
                                    type="button"
                                    onClick={() => onMoveSelect?.(m.moveNumber)}
                                    disabled={!onMoveSelect}
                                    aria-pressed={
                                        highlightedMoveNumber === m.moveNumber
                                    }
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-none px-3 py-1.5 text-left transition-colors border-2 border-transparent",
                                        onMoveSelect &&
                                            "cursor-pointer hover:border-border hover:bg-foreground hover:text-primary-foreground",
                                        highlightedMoveNumber ===
                                            m.moveNumber &&
                                            "border-border bg-foreground text-primary-foreground font-bold",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 text-right font-mono text-[11px] text-muted-foreground/70">
                                            {m.moveNumber}
                                        </span>
                                        <span
                                            className={cn(
                                                "inline-block size-2 rounded-full",
                                                m.player === "black"
                                                    ? "bg-stone-black"
                                                    : "bg-stone-white border border-border/50",
                                            )}
                                        />
                                        <span className="text-[13px] font-medium text-foreground">
                                            {m.player === "black"
                                                ? "Black"
                                                : "White"}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "font-mono text-[12px]",
                                            m.isPass
                                                ? "text-muted-foreground italic"
                                                : "text-foreground",
                                        )}
                                    >
                                        {m.isPass
                                            ? "pass"
                                            : (m.coordinate ?? "—")}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="mt-4 flex flex-col items-center justify-center text-center opacity-60">
                                <p className="text-xs text-muted-foreground italic">
                                    No moves yet
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

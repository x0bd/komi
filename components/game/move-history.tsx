"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LuChevronDown, LuChevronUp, LuHistory } from "react-icons/lu";

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
            : `Last move: ${lastMove.coordinate ?? "--"}`
        : "Opening ready";

    if (collapsed && !isEmbedded) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className="group mt-2 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="flex items-center justify-between border border-border bg-background transition-colors hover:bg-subtle">
                    <div className="flex min-w-0 items-center gap-3 px-3 py-3">
                        <LuHistory className="size-4 opacity-70" />
                        <div className="min-w-0">
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                                History
                            </p>
                            <p className="truncate font-sans text-[12px] text-muted-foreground">
                                {summaryText}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center border-l border-border">
                        <span className="border-r border-border px-3 py-4 font-mono text-[10px] text-muted-foreground">
                            {moveCount}
                        </span>
                        <span className="flex px-3 py-4">
                            <LuChevronDown className="size-4 text-muted-foreground" />
                        </span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "mt-2 flex flex-col overflow-hidden border border-border bg-background transition-all duration-300",
                className,
            )}
        >
            {!isEmbedded && (
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-3">
                    <div className="flex items-center gap-2.5">
                        <LuHistory className="size-4 text-foreground/70" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                            Replay Log
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="border border-border px-2 py-0.5 font-mono text-[10px]">
                            {moveCount}
                        </span>
                        {onToggle && (
                            <button
                                type="button"
                                onClick={onToggle}
                                aria-label="Collapse history"
                                className="flex size-6 items-center justify-center border border-border transition-colors hover:bg-foreground hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <LuChevronUp className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="min-h-0 flex-1">
                <ScrollArea
                    className={cn(
                        isEmbedded
                            ? "h-[min(55vh,380px)]"
                            : "h-[200px] lg:h-full lg:min-h-[260px]",
                    )}
                >
                    <div className={cn("flex flex-col gap-1", isEmbedded ? "p-4" : "p-3")}>
                        {hasMoves ? (
                            moves.map((m) => (
                                <button
                                    key={m.moveNumber}
                                    type="button"
                                    onClick={() => onMoveSelect?.(m.moveNumber)}
                                    disabled={!onMoveSelect}
                                    aria-pressed={highlightedMoveNumber === m.moveNumber}
                                    className={cn(
                                        "grid w-full grid-cols-[32px_16px_1fr_auto] items-center gap-3 border border-transparent px-3 py-2 text-left transition-colors",
                                        onMoveSelect && "cursor-pointer hover:border-border hover:bg-subtle",
                                        highlightedMoveNumber === m.moveNumber &&
                                            "border-border bg-foreground text-primary-foreground",
                                    )}
                                >
                                    <span className="text-right font-mono text-[11px] text-muted-foreground/70">
                                        {m.moveNumber}
                                    </span>
                                    <span
                                        className={cn(
                                            "inline-block size-2 border border-border",
                                            m.player === "black" ? "bg-stone-black" : "bg-stone-white",
                                        )}
                                    />
                                    <span className="font-sans text-[13px] font-medium text-inherit">
                                        {m.player === "black" ? "Black" : "White"}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-mono text-[12px]",
                                            m.isPass ? "italic text-muted-foreground" : "text-inherit",
                                        )}
                                    >
                                        {m.isPass ? "pass" : (m.coordinate ?? "--")}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="mt-2 border border-dashed border-border px-3 py-2 text-center">
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                    Awaiting first move
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

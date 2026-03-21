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
                className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            >
                <Card className="rounded-2xl border border-border shadow-md bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                                    <LuHistory className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-display text-lg font-bold text-foreground">
                                        History
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground font-body">
                                        {summaryText}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                    variant="secondary"
                                    className="rounded-full font-mono text-xs shadow-sm px-2.5 py-0.5"
                                >
                                    {moveCount}
                                </Badge>
                                <LuChevronDown className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </button>
        );
    }

    return (
        <Card
            className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-border shadow-md bg-card transition-all duration-300",
                isEmbedded &&
                    "rounded-none border-0 shadow-none bg-transparent",
                className,
            )}
        >
            {!isEmbedded && (
                <CardHeader className="shrink-0 px-5 pb-3 pt-5 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                                <LuHistory className="size-5" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="font-display text-xl font-bold leading-none">
                                    History
                                </CardTitle>
                                <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                    Replay Log
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="rounded-full font-mono text-xs shadow-sm px-2.5 py-0.5"
                            >
                                Moves: {moveCount}
                            </Badge>
                            {onToggle && (
                                <button
                                    type="button"
                                    onClick={onToggle}
                                    aria-label="Collapse history"
                                    className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <LuChevronUp className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            )}

            <CardContent
                className={cn("min-h-0 flex-1 p-0", !isEmbedded && "pt-0")}
            >
                <ScrollArea
                    className={cn(
                        isEmbedded
                            ? "h-[min(55vh,380px)]"
                            : "h-[200px] lg:h-full lg:min-h-[260px]",
                    )}
                >
                    <div
                        className={cn(
                            "flex flex-col gap-2",
                            isEmbedded ? "px-4 pb-6 pt-4" : "p-5",
                        )}
                    >
                        <div className="flex items-center justify-center rounded-xl bg-secondary/50 px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                            Game started
                        </div>

                        {hasMoves ? (
                            moves.map((m) => (
                                <button
                                    key={m.moveNumber}
                                    type="button"
                                    onClick={() => onMoveSelect?.(m.moveNumber)}
                                    disabled={!onMoveSelect}
                                    aria-pressed={highlightedMoveNumber === m.moveNumber}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                                        m.isPass
                                            ? "border-border/40 bg-secondary/30"
                                            : "border-border/60 bg-card hover:border-border shadow-sm",
                                        onMoveSelect && "cursor-pointer",
                                        highlightedMoveNumber === m.moveNumber &&
                                            "border-accent/70 bg-accent/10",
                                    )}
                                >
                                    <span className="w-6 text-center font-mono text-xs font-bold text-muted-foreground">
                                        {m.moveNumber}
                                    </span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <span
                                            className={cn(
                                                "inline-block size-3.5 rounded-full shadow-sm",
                                                m.player === "black"
                                                    ? "bg-stone-black"
                                                    : "bg-stone-white border border-border",
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold font-body leading-none">
                                                {m.player === "black"
                                                    ? "Black"
                                                    : "White"}
                                            </span>
                                            {m.isPass && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                                    Passed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            "font-mono text-sm font-bold",
                                            m.isPass
                                                ? "text-muted-foreground"
                                                : "text-foreground",
                                        )}
                                    >
                                        {m.isPass
                                            ? "Pass"
                                            : (m.coordinate ?? "—")}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="mt-4 flex flex-col items-center justify-center text-center opacity-60">
                                <LuSparkles className="size-6 text-muted-foreground mb-2" />
                                <p className="font-display text-sm font-semibold">
                                    No moves yet
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Place a stone to begin
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GameControls({
    onPass,
    onResign,
    disabled = false,
    className,
}: {
    onPass?: () => void;
    onResign?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex w-full items-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-2 shadow-sm backdrop-blur-xl",
                className,
            )}
        >
            <Button
                variant="ghost"
                className="h-10 flex-1 rounded-xl font-sans text-[14px] font-medium text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </Button>
            <div className="h-6 w-px shrink-0 bg-border/60" />
            <Button
                variant="ghost"
                className="h-10 flex-1 rounded-xl font-sans text-[14px] font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </Button>
        </div>
    );
}

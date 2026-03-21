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
                "flex items-center gap-2 mt-4 pt-4 border-t border-border/50",
                className,
            )}
        >
            <Button
                variant="ghost"
                size="sm"
                className="flex-1 font-sans font-medium text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-full h-9"
                onClick={onPass}
                disabled={disabled}
            >
                Pass turn
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button
                variant="ghost"
                size="sm"
                className="flex-1 font-sans font-medium text-[13px] text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-full h-9"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </Button>
        </div>
    );
}

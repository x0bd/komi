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
        <div className={cn("flex gap-3", className)}>
            <Button
                variant="outline"
                size="lg"
                className="min-h-[48px] flex-1 font-sans font-semibold text-[14px] bg-secondary/30 border-border/50 shadow-sm hover:shadow text-foreground hover:bg-secondary/50 rounded-xl"
                onClick={onPass}
                disabled={disabled}
            >
                Pass
            </Button>
            <Button
                variant="outline"
                size="lg"
                className="min-h-[48px] flex-1 font-sans font-semibold text-[14px] bg-destructive/5 border-destructive/20 shadow-sm hover:shadow text-destructive hover:border-destructive/30 hover:bg-destructive/10 rounded-xl"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </Button>
        </div>
    );
}

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
                className="min-h-[56px] flex-1 font-display font-semibold text-[15px] rounded-[1.25rem] bg-secondary/40 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-foreground hover:bg-secondary/60"
                onClick={onPass}
                disabled={disabled}
            >
                Pass
            </Button>
            <Button
                variant="outline"
                size="lg"
                className="min-h-[56px] flex-1 font-display font-semibold text-[15px] rounded-[1.25rem] bg-destructive/10 border border-destructive/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-destructive hover:text-destructive hover:border-destructive/20 hover:bg-destructive/20"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </Button>
        </div>
    );
}

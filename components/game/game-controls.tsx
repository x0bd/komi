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
                variant="secondary"
                size="lg"
                className="min-h-[52px] flex-1 font-display font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-border"
                onClick={onPass}
                disabled={disabled}
            >
                Pass
            </Button>
            <Button
                variant="destructive"
                size="lg"
                className="min-h-[52px] flex-1 font-display font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                onClick={onResign}
                disabled={disabled}
            >
                Resign
            </Button>
        </div>
    );
}

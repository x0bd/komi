"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type GameMode = "local" | "versus-ai";

export function ModeToggle({
    value = "local",
    onValueChange,
    className,
}: {
    value?: GameMode;
    onValueChange?: (value: GameMode) => void;
    className?: string;
}) {
    return (
        <ToggleGroup
            type="single"
            value={value ? [value] : []}
            onValueChange={(v) => v?.[0] && onValueChange?.(v[0] as GameMode)}
            className={cn(
                "w-full rounded-full border border-border bg-secondary p-1 shadow-sm",
                className,
            )}
        >
            <ToggleGroupItem
                value="local"
                className="flex-1 rounded-full min-h-[44px] font-display font-semibold text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
                Local
            </ToggleGroupItem>
            <ToggleGroupItem
                value="versus-ai"
                className="flex-1 rounded-full min-h-[44px] font-display font-semibold text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
                Versus AI
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

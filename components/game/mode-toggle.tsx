"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type GameMode = "local" | "versus-ai" | "online";

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
            value={value ? [value] : []}
            onValueChange={(v) => v?.[0] && onValueChange?.(v[0] as GameMode)}
            className={cn(
                "grid w-full grid-cols-3 border border-border bg-background [border-radius:0]",
                className,
            )}
        >
            <ToggleGroupItem
                value="local"
                className="h-10 min-w-0 border-r border-border font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors [border-radius:0] hover:bg-subtle hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground"
            >
                Local
            </ToggleGroupItem>
            <ToggleGroupItem
                value="versus-ai"
                className="h-10 min-w-0 border-r border-border font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors [border-radius:0] hover:bg-subtle hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground"
            >
                Versus AI
            </ToggleGroupItem>
            <ToggleGroupItem
                value="online"
                className="h-10 min-w-0 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors [border-radius:0] hover:bg-subtle hover:text-foreground data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground"
            >
                Online
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

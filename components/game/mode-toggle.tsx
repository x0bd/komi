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
                "w-full rounded-full border border-border/60 bg-[#f0eee9] dark:bg-secondary/40 p-1.5 shadow-sm",
                className,
            )}
        >
            <ToggleGroupItem
                value="local"
                className="flex-1 rounded-full h-10 font-sans font-medium text-[14px] data-[state=on]:bg-[#e4e2dd] dark:data-[state=on]:bg-background data-[state=on]:text-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Local
            </ToggleGroupItem>
            <ToggleGroupItem
                value="versus-ai"
                className="flex-1 rounded-full h-10 font-sans font-medium text-[14px] data-[state=on]:bg-[#e4e2dd] dark:data-[state=on]:bg-background data-[state=on]:text-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Versus AI
            </ToggleGroupItem>
            <ToggleGroupItem
                value="online"
                className="flex-1 rounded-full h-10 font-sans font-medium text-[14px] data-[state=on]:bg-[#e4e2dd] dark:data-[state=on]:bg-background data-[state=on]:text-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Online
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

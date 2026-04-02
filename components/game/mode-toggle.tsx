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
                "w-full rounded-none border-2 border-border bg-background p-1.5 shadow-[4px_4px_0_0_var(--foreground)]",
                className,
            )}
        >
            <ToggleGroupItem
                value="local"
                className="flex-1 rounded-none h-10 font-mono font-bold uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-border data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Local
            </ToggleGroupItem>
            <ToggleGroupItem
                value="versus-ai"
                className="flex-1 rounded-none h-10 font-mono font-bold uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-border data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Versus AI
            </ToggleGroupItem>
            <ToggleGroupItem
                value="online"
                className="flex-1 rounded-none h-10 font-mono font-bold uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-border data-[state=on]:bg-foreground data-[state=on]:text-primary-foreground transition-all duration-300 text-muted-foreground hover:text-foreground"
            >
                Online
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

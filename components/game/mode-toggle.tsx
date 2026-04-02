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
                "w-full rounded-none border-[3px] border-white bg-black p-[3px] shadow-[6px_6px_0_0_var(--swiss-red)]",
                className,
            )}
        >
            <ToggleGroupItem
                value="local"
                className="flex-1 rounded-none h-10 font-mono font-black uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-black/20 data-[state=on]:bg-white data-[state=on]:text-black transition-all duration-300 text-white/50 hover:text-white"
            >
                Local
            </ToggleGroupItem>
            <ToggleGroupItem
                value="versus-ai"
                className="flex-1 rounded-none h-10 font-mono font-black uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-black/20 data-[state=on]:bg-white data-[state=on]:text-black transition-all duration-300 text-white/50 hover:text-white"
            >
                Versus AI
            </ToggleGroupItem>
            <ToggleGroupItem
                value="online"
                className="flex-1 rounded-none h-10 font-mono font-black uppercase tracking-widest text-[12px] border border-transparent data-[state=on]:border-black/20 data-[state=on]:bg-white data-[state=on]:text-black transition-all duration-300 text-white/50 hover:text-white"
            >
                Online
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

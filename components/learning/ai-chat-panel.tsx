"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LuBot,
    LuBrainCircuit,
    LuBookOpenText,
    LuSparkles,
    LuTarget,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

export type ChatMessage = {
    id: string;
    text: string;
    tone?: "coach" | "tip" | "warning" | "celebrate";
};

const QUICK_TIPS = [
    { label: "Opening tips", icon: LuBookOpenText },
    { label: "How to capture", icon: LuTarget },
    { label: "Territory", icon: LuBrainCircuit },
];

export function AIChatPanel({
    messages,
    onTipClick,
    coachMood = "focus",
    coachGoal = "Build influence from the corners and keep stones connected.",
    coachCue = "Play near your strongest group and avoid thin cuts.",
    className,
}: {
    messages: ChatMessage[];
    onTipClick?: (tip: string) => void;
    coachMood?: "calm" | "focus" | "warning" | "celebrate";
    coachGoal?: string;
    coachCue?: string;
    className?: string;
}) {
    return (
        <Card
            className={cn(
                "flex flex-col w-full shrink-0 overflow-hidden rounded-[2rem] border-[3px] border-primary bg-card shadow-[8px_8px_0_theme(colors.primary.DEFAULT)]",
                className,
            )}
        >
            {/* Header - Bold Sumi Ink */}
            <div className="relative shrink-0 border-b-[3px] border-primary bg-primary px-5 py-4 text-primary-foreground">
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full border-2 border-primary-foreground/20 bg-primary-foreground/10 text-accent">
                            <LuBot className="size-6" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-extrabold tracking-wide">
                                Sensei AI
                            </h3>
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                                <span className="size-2 rounded-full bg-status-active shadow-[0_0_8px_theme(colors.status.active)] animate-pulse-gentle" />
                                Live Tutor
                            </p>
                        </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 text-accent">
                        <LuSparkles className="size-5" />
                    </div>
                </div>
            </div>

            {/* Active Coaching - Hanko Stamp Vibe */}
            <div className="shrink-0 border-b-[3px] border-primary/10 bg-secondary/40 px-5 py-5">
                <div className="relative rounded-2xl border-[3px] border-accent bg-card px-4 py-4 shadow-[4px_4px_0_theme(colors.accent.DEFAULT)]">
                    <div className="absolute -top-3 left-4 flex items-center gap-1.5 bg-card px-2 font-display text-[11px] font-black uppercase tracking-[0.2em] text-destructive">
                        <LuTarget className="size-3.5" />
                        Mission
                    </div>
                    <p className="font-display text-base font-bold leading-tight text-foreground">
                        {coachGoal}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                        {coachCue}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-background/50">
                <div className="flex flex-col gap-4 p-5">
                    <div className="self-center rounded-full border-2 border-border border-dashed bg-secondary/50 px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Game Started
                    </div>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "self-start max-w-[88%] rounded-2xl rounded-tl-sm border-[2.5px] border-primary/15 bg-card px-4 py-3 text-[14px] font-semibold text-foreground shadow-sm",
                                msg.tone === "warning" &&
                                    "border-destructive/40 bg-destructive/10 text-destructive",
                                msg.tone === "celebrate" &&
                                    "border-status-active/40 bg-status-active/10 text-status-active",
                            )}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Quick Tips - Tactile Pills */}
            <div className="shrink-0 border-t-[3px] border-primary/10 bg-card px-5 py-4">
                <p className="mb-3 font-display text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Ask Sensei
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {QUICK_TIPS.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            className="group flex items-center gap-2 rounded-xl border-2 border-border bg-secondary/50 px-3 py-2 font-display text-xs font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-accent hover:text-primary hover:shadow-[3px_3px_0_theme(colors.primary.DEFAULT)]"
                            onClick={() => onTipClick?.(label)}
                        >
                            <Icon className="size-4 opacity-70 group-hover:opacity-100" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
}

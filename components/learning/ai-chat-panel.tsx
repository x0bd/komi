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
                "flex flex-col w-full shrink-0 overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl",
                className,
            )}
        >
            {/* Header - Friendly & Playful (Teal Accent) */}
            <div className="relative shrink-0 bg-tutor-accent px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative flex size-12 items-center justify-center rounded-full border-[2.5px] border-white/20 bg-white/20 text-white shadow-sm">
                        <LuBot className="size-7" />
                        {/* Online status indicator */}
                        <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-tutor-accent bg-[#4ade80]" />
                    </div>
                    <div>
                        <h3 className="font-display text-xl font-bold tracking-wide text-white">
                            Sensei
                        </h3>
                        <p className="font-medium text-white/80 text-xs uppercase tracking-widest">
                            Live Tutor
                        </p>
                    </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
                    <LuSparkles className="size-5" />
                </div>
            </div>

            {/* Active Coaching / Current Goal - Like a Duolingo lesson hint */}
            <div className="shrink-0 bg-tutor-surface/40 px-5 py-4 border-b border-border/50">
                <div className="flex gap-4">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-tutor-accent/20 text-tutor-accent">
                        <LuTarget className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-display text-[12px] font-bold uppercase tracking-widest text-tutor-accent">
                            Current Focus
                        </p>
                        <p className="text-[15px] font-medium leading-snug text-foreground">
                            {coachGoal}
                        </p>
                        <p className="text-sm font-normal text-muted-foreground">
                            {coachCue}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Chat Area */}
            <ScrollArea className="flex-1 bg-background/40">
                <div className="flex flex-col gap-5 p-5">
                    <div className="self-center rounded-full bg-secondary/80 px-4 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Match Started
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={msg.id} className="flex gap-3 max-w-[92%]">
                            {/* Only show avatar on the last message in a cluster or if it's the only one */}
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tutor-surface text-tutor-accent mt-auto">
                                <LuBot className="size-[18px]" />
                            </div>
                            <div
                                className={cn(
                                    "relative rounded-2xl rounded-bl-sm px-4 py-3 text-[14.5px] font-medium leading-relaxed shadow-sm",
                                    msg.tone === "warning"
                                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                                        : msg.tone === "celebrate"
                                          ? "bg-status-active/10 text-status-active border border-status-active/20"
                                          : "bg-tutor-surface text-tutor-foreground border border-tutor-accent/10",
                                )}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Quick Tips Area */}
            <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ask a question
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {QUICK_TIPS.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            className="group flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-tutor-accent/40 hover:bg-tutor-surface/40 hover:text-tutor-foreground hover:shadow-sm active:translate-y-0 active:shadow-none"
                            onClick={() => onTipClick?.(label)}
                        >
                            <Icon className="size-4 text-tutor-accent/70 group-hover:text-tutor-accent" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
}

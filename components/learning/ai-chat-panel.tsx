"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
                "flex flex-col w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300",
                className,
            )}
        >
            {/* Header matches MoveHistory sidepane style */}
            <CardHeader className="shrink-0 px-5 pb-3 pt-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-10 items-center justify-center rounded-full bg-tutor-surface text-tutor-accent">
                            <LuBot className="size-5" />
                            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-status-active" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="font-display text-lg font-bold text-foreground">
                                Sensei
                            </CardTitle>
                            <p className="flex items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-status-active shadow-[0_0_4px_theme(colors.status.active)] animate-pulse-gentle" />
                                Live Tutor
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center text-muted-foreground/50">
                        <LuSparkles className="size-5" />
                    </div>
                </div>
            </CardHeader>

            {/* Active Coaching / Current Goal - Washi style */}
            <div className="shrink-0 bg-secondary/40 px-5 py-4 border-b border-border/40">
                <div className="flex gap-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                        <LuTarget className="size-3.5" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-display text-[11px] font-bold uppercase tracking-widest text-accent-foreground">
                            Current Focus
                        </p>
                        <p className="text-sm font-medium leading-snug text-foreground">
                            {coachGoal}
                        </p>
                        <p className="text-xs font-normal text-muted-foreground">
                            {coachCue}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Chat Area */}
            <ScrollArea className="flex-1 bg-background/50">
                <div className="flex flex-col gap-4 p-5">
                    <div className="self-center rounded-full bg-secondary px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Match Started
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3 max-w-[92%]">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tutor-surface text-tutor-accent mt-auto shadow-sm">
                                <LuBot className="size-4" />
                            </div>
                            <div
                                className={cn(
                                    "relative rounded-2xl rounded-bl-sm px-4 py-3 text-[14px] font-medium leading-relaxed shadow-sm",
                                    msg.tone === "warning"
                                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                                        : msg.tone === "celebrate"
                                          ? "bg-status-active/10 text-status-active border border-status-active/20"
                                          : "bg-card border border-border text-foreground",
                                )}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Quick Tips Area - Clean pills */}
            <div className="shrink-0 border-t border-border/40 bg-card px-5 py-4">
                <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ask a question
                </p>
                <div className="flex flex-wrap gap-2">
                    {QUICK_TIPS.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            className="group flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-border/80 hover:bg-secondary hover:text-foreground hover:shadow-sm"
                            onClick={() => onTipClick?.(label)}
                        >
                            <Icon className="size-4 opacity-70 group-hover:opacity-100 group-hover:text-tutor-accent" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
}

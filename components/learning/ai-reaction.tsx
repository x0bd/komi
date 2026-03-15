"use client";

import { useEffect, useState } from "react";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";
import { LuBot } from "react-icons/lu";

export function AIReaction({ className }: { className?: string }) {
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorPulseKey = useLearningStore((state) => state.tutorPulseKey);

    // Pick the most recent message as the "reaction"
    const latestMessage = chatMessages[chatMessages.length - 1];

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (latestMessage) {
            // Force re-trigger animation even if it's currently visible
            setVisible(false);
            const showTimer = setTimeout(() => {
                setVisible(true);
            }, 50);

            // Auto hide after some time so it feels like a pop-up reaction
            const hideTimer = setTimeout(() => {
                setVisible(false);
            }, 7000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [tutorPulseKey, latestMessage?.id]);

    if (!latestMessage) return null;

    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-x-4 bottom-8 z-50 flex justify-center lg:bottom-10",
                className,
            )}
        >
            <div
                className={cn(
                    "pointer-events-auto flex max-w-[22rem] items-center gap-4 rounded-[20px] border border-border bg-card p-3 pr-5 shadow-2xl transition-all duration-700 ease-out",
                    visible
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-10 scale-95 opacity-0",
                )}
            >
                {/* AI Avatar styled based on mood */}
                <div
                    className={cn(
                        "flex size-[42px] shrink-0 items-center justify-center rounded-full border border-border shadow-sm transition-colors duration-500",
                        tutorMood === "celebrate" && "bg-status-active/15 text-status-active border-status-active/30",
                        tutorMood === "warning" && "bg-destructive/10 text-destructive border-destructive/20",
                        tutorMood === "focus" && "bg-accent/15 text-accent-foreground border-accent/30",
                        tutorMood === "calm" && "bg-primary/5 text-primary",
                    )}
                >
                    <LuBot className="size-6" />
                </div>

                <div className="flex-1 space-y-0.5 min-w-0">
                    <p className="font-display text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
                        {tutorMood === "celebrate" && "Sensei is impressed"}
                        {tutorMood === "warning" && "Sensei is concerned"}
                        {tutorMood === "focus" && "Sensei is watching"}
                        {tutorMood === "calm" && "Sensei"}
                    </p>
                    <p className="text-[13px] font-medium leading-snug text-foreground text-pretty">
                        {latestMessage.text}
                    </p>
                </div>
            </div>
        </div>
    );
}

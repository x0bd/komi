"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { AIChatPanel } from "@/components/learning/ai-chat-panel";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";
import { LuChevronDown, LuSparkles } from "react-icons/lu";

export function ChatDock({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const [canHover, setCanHover] = useState(false);
    const [hovered, setHovered] = useState(false);
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const requestTip = useLearningStore((state) => state.requestTip);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorGoal = useLearningStore((state) => state.tutorGoal);
    const tutorCue = useLearningStore((state) => state.tutorCue);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const contentRef = useRef<HTMLSpanElement | null>(null);
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const labelRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
        );
        const sync = () => setCanHover(mediaQuery.matches);

        sync();
        mediaQuery.addEventListener("change", sync);

        return () => mediaQuery.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        const button = buttonRef.current;
        const content = contentRef.current;
        const icon = iconRef.current;
        const label = labelRef.current;
        if (!button || !content || !icon || !label) return;

        const shouldExpand = open || hovered || !canHover;

        gsap.killTweensOf([button, content, icon, label]);

        const timeline = gsap.timeline({
            defaults: {
                duration: shouldExpand ? 0.32 : 0.22,
                ease: shouldExpand ? "power3.out" : "power2.inOut",
            },
        });

        timeline.to(
            button,
            {
                width: shouldExpand ? 220 : 58,
            },
            0,
        );

        timeline.to(
            content,
            {
                autoAlpha: shouldExpand ? 1 : 0,
                x: shouldExpand ? 0 : -10,
            },
            0,
        );

        timeline.to(
            label,
            {
                autoAlpha: shouldExpand ? 1 : 0,
                y: shouldExpand ? 0 : 2,
            },
            0,
        );

        timeline.to(
            icon,
            {
                scale: shouldExpand ? 1.05 : 1,
                rotate: shouldExpand ? 4 : 0,
            },
            0,
        );

        return () => timeline.kill();
    }, [canHover, hovered, open]);

    const buttonLabel = open ? "Hide Sensei" : "Open Sensei";
    const shouldShowPill = open || hovered || !canHover;

    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-x-4 bottom-4 z-30 flex justify-start lg:inset-x-6 lg:bottom-6",
                className,
            )}
        >
            <div className="pointer-events-auto flex flex-col items-start gap-3">
                {open ? (
                    <div className="w-[min(28rem,calc(100vw-1.5rem))] rounded-3xl border border-border bg-card p-3 shadow-lg">
                        <AIChatPanel
                            messages={chatMessages}
                            onTipClick={requestTip}
                            coachMood={tutorMood}
                            coachGoal={tutorGoal}
                            coachCue={tutorCue}
                            className="h-[380px] min-h-[380px] rounded-2xl border-none shadow-none"
                        />
                    </div>
                ) : null}
                <Button
                    ref={buttonRef}
                    variant="outline"
                    type="button"
                    aria-expanded={open}
                    aria-label={buttonLabel}
                    className={cn(
                        "h-[56px] w-[56px] justify-start overflow-hidden rounded-full px-0 shadow-md transition-all duration-300 border hover:-translate-y-0.5",
                        open
                            ? "bg-card border-border"
                            : "bg-secondary/40 border-border/50 hover:bg-secondary/60 hover:shadow-lg",
                    )}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onFocus={() => setHovered(true)}
                    onBlur={() => setHovered(false)}
                    onClick={() => setOpen((current) => !current)}
                >
                    <span className="flex w-full items-center gap-0 px-[6px]">
                        <span
                            ref={iconRef}
                            className={cn(
                                "relative flex size-11 shrink-0 items-center justify-center rounded-full shadow-sm",
                                open
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-accent border border-border",
                            )}
                        >
                            <LuSparkles className="size-[18px]" />
                        </span>
                        <span
                            ref={contentRef}
                            className="ml-3 block whitespace-nowrap opacity-0"
                        >
                            <span className="flex items-center gap-3 pr-4">
                                <span
                                    ref={labelRef}
                                    className="flex flex-col items-start leading-none opacity-0"
                                >
                                    <span className="font-display text-sm font-semibold">
                                        {buttonLabel}
                                    </span>
                                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <LuSparkles className="size-3" />
                                        Sensei Coach
                                    </span>
                                </span>
                                {open ? (
                                    <LuChevronDown className="size-4 text-muted-foreground" />
                                ) : null}
                            </span>
                        </span>
                    </span>
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LuBot, LuSparkles, LuTarget, LuTriangleAlert } from "react-icons/lu";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";

export function AIReaction({ className }: { className?: string }) {
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorPulseKey = useLearningStore((state) => state.tutorPulseKey);

    const latestMessage = chatMessages[chatMessages.length - 1];

    const [visible, setVisible] = useState(false);
    const [displayMessage, setDisplayMessage] = useState<typeof latestMessage>();
    const [displayMood, setDisplayMood] = useState(tutorMood);

    const cardRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!latestMessage) return;

        setDisplayMessage(latestMessage);
        setDisplayMood(tutorMood);
        setVisible(false);

        const showTimer = window.setTimeout(() => {
            setVisible(true);
        }, 80);
        const hideTimer = window.setTimeout(() => {
            setVisible(false);
        }, 6000);

        return () => {
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimer);
        };
    }, [tutorPulseKey, latestMessage, tutorMood]);

    useEffect(() => {
        if (!visible) return;
        const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (shouldReduceMotion) return;

        if (cardRef.current) {
            gsap.fromTo(
                cardRef.current,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" },
            );
        }

        if (progressRef.current) {
            gsap.fromTo(
                progressRef.current,
                { scaleX: 1, transformOrigin: "left center" },
                { scaleX: 0, duration: 6, ease: "none" },
            );
        }

        return () => {
            gsap.killTweensOf(cardRef.current);
            gsap.killTweensOf(progressRef.current);
        };
    }, [visible]);

    if (!displayMessage) return null;

    const tone =
        displayMood === "celebrate"
            ? {
                  Icon: LuSparkles,
                  label: "[STRONG]",
                  title: "Strong move",
                  accent: "bg-status-active",
              }
            : displayMood === "warning"
              ? {
                    Icon: LuTriangleAlert,
                    label: "[REVIEW]",
                    title: "Sensei is concerned",
                    accent: "bg-destructive",
                }
              : displayMood === "focus"
                ? {
                      Icon: LuTarget,
                      label: "[FOCUS]",
                      title: "Focus cue",
                      accent: "bg-accent",
                  }
                : {
                      Icon: LuBot,
                      label: "[LIVE]",
                      title: "Sensei note",
                      accent: "bg-signal",
                  };

    const Icon = tone.Icon;

    return (
        <div
            className={cn(
                "pointer-events-none fixed bottom-5 right-5 z-50 flex justify-end lg:bottom-6 lg:right-6",
                className,
            )}
        >
            <div
                ref={cardRef}
                className={cn(
                    "pointer-events-auto w-[min(24rem,calc(100vw-2.5rem))] border border-border bg-background transition-opacity duration-200",
                    visible ? "opacity-100" : "translate-y-3 opacity-0",
                )}
            >
                <div className="grid grid-cols-[48px_1fr] border-b border-border">
                    <div className="flex items-center justify-center border-r border-border">
                        <Icon className="size-4 text-foreground" />
                    </div>
                    <div className="min-w-0 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                {tone.label}
                            </span>
                            <span className={cn("h-2 w-2", tone.accent)} />
                        </div>
                        <p className="mt-1 font-sans text-[15px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                            {tone.title}
                        </p>
                    </div>
                </div>

                <p className="px-4 py-3 font-sans text-[13px] leading-relaxed text-foreground">
                    {displayMessage.text}
                </p>

                <div className="h-px overflow-hidden bg-border">
                    <div ref={progressRef} className={cn("h-full w-full", tone.accent)} />
                </div>
            </div>
        </div>
    );
}

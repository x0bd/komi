"use client";

import { useEffect, useState, useRef } from "react";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";
import { LuBot, LuSparkles, LuFlame, LuTriangleAlert } from "react-icons/lu";
import { gsap } from "gsap";

export function AIReaction({ className }: { className?: string }) {
    const chatMessages = useLearningStore((state) => state.chatMessages);
    const tutorMood = useLearningStore((state) => state.tutorMood);
    const tutorPulseKey = useLearningStore((state) => state.tutorPulseKey);

    // Pick the most recent message as the "reaction"
    const latestMessage = chatMessages[chatMessages.length - 1];

    const [visible, setVisible] = useState(false);
    const [displayMessage, setDisplayMessage] = useState(latestMessage);
    const [displayMood, setDisplayMood] = useState(tutorMood);

    const glowRef = useRef<HTMLDivElement | null>(null);
    const iconRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (latestMessage && latestMessage.id !== displayMessage?.id) {
            // New message arrived
            setDisplayMessage(latestMessage);
            setDisplayMood(tutorMood);

            // Force re-trigger animation
            setVisible(false);
            const showTimer = setTimeout(() => {
                setVisible(true);
            }, 100);

            // Auto hide after some time
            const hideTimer = setTimeout(() => {
                setVisible(false);
            }, 6000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [tutorPulseKey, latestMessage, displayMessage?.id, tutorMood]);

    // Initial mount visibility
    useEffect(() => {
        if (latestMessage) {
            setVisible(true);
            const hideTimer = setTimeout(() => {
                setVisible(false);
            }, 6000);
            return () => clearTimeout(hideTimer);
        }
    }, [latestMessage]);

    // Animate bars and glow when visible
    useEffect(() => {
        if (!visible) return;

        let timeline: gsap.core.Timeline | null = null;

        if (iconRef.current) {
            timeline = gsap.timeline({
                defaults: { ease: "power2.inOut" },
            });

            timeline.fromTo(
                iconRef.current,
                { y: 0, rotate: 0, scale: 1 },
                {
                    y: -1.5,
                    rotate: 3,
                    scale: 1.04,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                },
                0,
            );

            if (glowRef.current) {
                timeline.fromTo(
                    glowRef.current,
                    { opacity: 0.05, scale: 0.92 },
                    {
                        opacity: 0.14,
                        scale: 1.04,
                        duration: 1.4,
                        repeat: -1,
                        yoyo: true,
                    },
                    0,
                );
            }
        }

        // Animate the timeout progress bar at the bottom
        if (progressRef.current) {
            gsap.fromTo(
                progressRef.current,
                { width: "100%" },
                { width: "0%", duration: 6, ease: "none" },
            );
        }

        return () => {
            if (timeline) timeline.kill();
            gsap.killTweensOf(progressRef.current);
        };
    }, [visible]);

    if (!displayMessage) return null;

    // Theming logic based on AI mood
    let moodColorClass = "from-primary/40 via-primary/20 to-primary/10";
    let iconColorClass = "text-primary";
    let Icon = LuBot;
    let title = "Sensei note";
    let accentClass = "bg-primary/10 text-primary";
    let borderClass = "border-border/70";
    let iconSurfaceClass = "bg-primary/10 text-primary";
    let glowColor = "var(--primary)";
    let progressColor = "bg-primary/30";

    if (displayMood === "celebrate") {
        iconColorClass = "text-status-active";
        Icon = LuSparkles;
        title = "Strong move";
        accentClass = "bg-status-active/10 text-status-active";
        borderClass = "border-status-active/20";
        iconSurfaceClass = "bg-status-active/12 text-status-active";
        glowColor = "var(--status-active)";
        progressColor = "bg-status-active/40";
    } else if (displayMood === "warning") {
        iconColorClass = "text-destructive";
        Icon = LuTriangleAlert;
        title = "Sensei note";
        accentClass = "bg-destructive/10 text-destructive";
        borderClass = "border-destructive/20";
        iconSurfaceClass = "bg-destructive/10 text-destructive";
        glowColor = "var(--destructive)";
        progressColor = "bg-destructive/35";
    } else if (displayMood === "focus") {
        iconColorClass = "text-amber-600 dark:text-amber-400";
        Icon = LuFlame;
        title = "Focus cue";
        accentClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        borderClass = "border-amber-500/20";
        iconSurfaceClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        glowColor = "var(--accent)";
        progressColor = "bg-amber-500/35";
    }

    return (
        <div
            className={cn(
                "pointer-events-none fixed bottom-5 right-5 z-50 flex justify-end lg:bottom-6 lg:right-6",
                className,
            )}
        >
            <div
                className={cn(
                    "pointer-events-auto w-full max-w-[22rem] transition-all duration-500 ease-out",
                    visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0",
                )}
            >
                <div
                    className={cn(
                        "relative overflow-hidden rounded-none border-[3px] border-border bg-background shadow-[8px_8px_0_0_var(--foreground)]",
                        borderClass,
                    )}
                >
                    <div
                        ref={glowRef}
                        className="absolute inset-0 pointer-events-none opacity-[0.05] blur-3xl transition-colors duration-500"
                        style={{ backgroundColor: glowColor }}
                    />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

                    <div className="relative p-3.5">
                        <div className="flex items-start gap-3.5">
                            <div
                                ref={iconRef}
                                className={cn(
                                    "relative mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-none border-2 border-border shadow-[2px_2px_0_0_var(--foreground)]",
                                    iconSurfaceClass,
                                )}
                            >
                                <div className="absolute inset-[4px] rounded-none bg-background/90" />
                                <Icon
                                    className={cn(
                                        "relative z-10 size-4.5",
                                        iconColorClass,
                                    )}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                                            accentClass,
                                        )}
                                    >
                                        {title}
                                    </span>
                                </div>
                                <p className="mt-2 text-[13.5px] font-semibold leading-[1.5] text-foreground text-balance">
                                    {displayMessage.text}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-secondary/50">
                            <div
                                ref={progressRef}
                                className={cn("h-full rounded-full", progressColor)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

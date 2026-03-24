"use client";

import { useEffect, useState, useRef } from "react";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";
import { LuBot, LuSparkles, LuFlame, LuTriangleAlert } from "react-icons/lu";
import { gsap } from "gsap";

const BAR_COUNT = 5;

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
    const barRefs = useRef<Array<HTMLDivElement | null>>([]);
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

        const activeBars = barRefs.current.filter(Boolean);
        let timeline: gsap.core.Timeline | null = null;

        if (activeBars.length) {
            timeline = gsap.timeline({
                defaults: { ease: "power2.inOut" },
            });

            // Bounce the bars
            timeline.fromTo(
                activeBars,
                { height: "20%" },
                {
                    height: () => `${40 + Math.random() * 60}%`,
                    duration: 0.4,
                    repeat: -1,
                    yoyo: true,
                    stagger: { amount: 0.3, from: "center" },
                },
                0,
            );

            if (glowRef.current) {
                timeline.fromTo(
                    glowRef.current,
                    { opacity: 0.1 },
                    {
                        opacity: 0.25,
                        duration: 1,
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
    let glowColor = "var(--primary)";
    let progressColor = "bg-primary/30";

    if (displayMood === "celebrate") {
        moodColorClass = "from-status-active via-accent to-status-active/20";
        iconColorClass = "text-status-active";
        Icon = LuSparkles;
        title = "Strong move";
        accentClass = "bg-status-active/10 text-status-active";
        borderClass = "border-status-active/20";
        glowColor = "var(--status-active)";
        progressColor = "bg-status-active/40";
    } else if (displayMood === "warning") {
        moodColorClass =
            "from-destructive via-destructive/50 to-destructive/20";
        iconColorClass = "text-destructive";
        Icon = LuTriangleAlert;
        title = "Sensei note";
        accentClass = "bg-destructive/10 text-destructive";
        borderClass = "border-destructive/20";
        glowColor = "var(--destructive)";
        progressColor = "bg-destructive/35";
    } else if (displayMood === "focus") {
        moodColorClass = "from-accent via-accent/50 to-xp-streak/50";
        iconColorClass = "text-accent-foreground";
        Icon = LuFlame;
        title = "Focus cue";
        accentClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
        borderClass = "border-amber-500/20";
        glowColor = "var(--accent)";
        progressColor = "bg-amber-500/35";
    }

    return (
        <div
            className={cn(
                "pointer-events-none fixed left-20 right-4 top-4 z-50 flex justify-start lg:left-28 lg:right-auto lg:top-6",
                className,
            )}
        >
            <div
                className={cn(
                    "pointer-events-auto w-full max-w-[26rem] transition-all duration-500 ease-out lg:max-w-[22rem]",
                    visible
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-3 opacity-0",
                )}
            >
                <div
                    className={cn(
                        "relative overflow-hidden rounded-[1.7rem] border bg-background/88 shadow-[0_18px_55px_-32px_rgba(20,16,10,0.35)] backdrop-blur-xl",
                        borderClass,
                    )}
                >
                    <div
                        ref={glowRef}
                        className="absolute inset-0 pointer-events-none opacity-[0.06] blur-3xl transition-colors duration-500"
                        style={{ backgroundColor: glowColor }}
                    />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

                    <div className="relative p-3.5 lg:p-4">
                        <div className="flex items-start gap-3.5">
                            <div className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/60">
                                <div className="absolute inset-[7px] flex items-end justify-between gap-[2px] opacity-55">
                                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                                        <div
                                            key={i}
                                            ref={(el) => {
                                                barRefs.current[i] = el;
                                            }}
                                            className={cn(
                                                "w-[3px] rounded-full bg-gradient-to-t",
                                                moodColorClass,
                                            )}
                                        />
                                    ))}
                                </div>
                                <Icon
                                    className={cn(
                                        "relative z-10 size-4",
                                        iconColorClass,
                                    )}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                                            accentClass,
                                        )}
                                    >
                                        {title}
                                    </span>
                                </div>
                                <p className="mt-2 text-[14px] font-semibold leading-[1.45] text-foreground text-balance">
                                    {displayMessage.text}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-secondary/55">
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

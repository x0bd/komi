"use client";

import { useEffect, useState, useRef } from "react";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";
import { LuBot, LuSparkles, LuFlame, LuTriangleAlert } from "react-icons/lu";
import { Card, CardContent } from "@/components/ui/card";
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
    let title = "Sensei";
    let glowColor = "var(--primary)";
    let progressColor = "bg-primary/40";

    if (displayMood === "celebrate") {
        moodColorClass = "from-status-active via-accent to-status-active/20";
        iconColorClass = "text-status-active";
        Icon = LuSparkles;
        title = "Sensei is impressed";
        glowColor = "var(--status-active)";
        progressColor = "bg-status-active";
    } else if (displayMood === "warning") {
        moodColorClass =
            "from-destructive via-destructive/50 to-destructive/20";
        iconColorClass = "text-destructive";
        Icon = LuTriangleAlert;
        title = "Sensei is concerned";
        glowColor = "var(--destructive)";
        progressColor = "bg-destructive";
    } else if (displayMood === "focus") {
        moodColorClass = "from-accent via-accent/50 to-xp-streak/50";
        iconColorClass = "text-accent-foreground";
        Icon = LuFlame;
        title = "Sensei is focused";
        glowColor = "var(--accent)";
        progressColor = "bg-accent";
    }

    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-center lg:top-6",
                className,
            )}
        >
            <div
                className={cn(
                    "pointer-events-auto w-full max-w-[24rem] transition-all duration-700 ease-out",
                    visible
                        ? "translate-y-0 scale-100 opacity-100"
                        : "-translate-y-10 scale-95 opacity-0",
                )}
            >
                <Card className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    {/* Background mood glow */}
                    <div
                        ref={glowRef}
                        className="absolute inset-0 pointer-events-none blur-2xl transition-colors duration-500"
                        style={{ backgroundColor: glowColor }}
                    />

                    <CardContent className="relative p-0">
                        <div className="flex items-center gap-4 p-4">
                            {/* Graphic Bars Area - similar to live streak */}
                            <div className="relative flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-secondary/80 shadow-sm">
                                <div className="absolute inset-x-1.5 bottom-1.5 top-2 flex items-end justify-between gap-0.5 opacity-60">
                                    {Array.from({ length: BAR_COUNT }).map(
                                        (_, i) => (
                                            <div
                                                key={i}
                                                ref={(el) => {
                                                    barRefs.current[i] = el;
                                                }}
                                                className={cn(
                                                    "w-[4.5px] rounded-full bg-gradient-to-t shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)]",
                                                    moodColorClass,
                                                )}
                                            />
                                        ),
                                    )}
                                </div>
                                <Icon
                                    className={cn(
                                        "relative z-10 size-5 drop-shadow-sm",
                                        iconColorClass,
                                    )}
                                />
                            </div>

                            {/* Text Content */}
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    {title}
                                </p>
                                <p className="mt-0.5 font-body text-[13.5px] font-medium leading-snug text-foreground text-pretty">
                                    {displayMessage.text}
                                </p>
                            </div>
                        </div>

                        {/* Timeout progress line */}
                        <div className="h-[3px] w-full bg-secondary/50">
                            <div
                                ref={progressRef}
                                className={cn("h-full", progressColor)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

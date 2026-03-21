"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import {
    LuActivity,
    LuChevronDown,
    LuChevronUp,
    LuFlame,
    LuSparkles,
} from "react-icons/lu";
import { Card, CardContent } from "@/components/ui/card";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = [18, 24, 30, 22, 36, 28, 42, 32, 48, 36, 54, 42];
const BAR_COUNT = BAR_HEIGHTS.length;

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getMomentumTone(energy: number) {
    if (energy >= 80) return "Burning hot";
    if (energy >= 60) return "Charging fast";
    if (energy >= 40) return "Holding shape";
    if (energy >= 20) return "Finding rhythm";
    return "Low pressure";
}

export function XPBar({
    collapsed = false,
    onToggle,
}: {
    collapsed?: boolean;
    onToggle?: () => void;
}) {
    const streak = useLearningStore((state) => state.streak);
    const xp = useLearningStore((state) => state.xp);
    const liveStreak = useLearningStore((state) => state.liveStreak);
    const lastStreakEvent = useLearningStore((state) => state.lastStreakEvent);
    const lastStreakDelta = useLearningStore((state) => state.lastStreakDelta);
    const streakPulseKey = useLearningStore((state) => state.streakPulseKey);

    const barRefs = useRef<Array<HTMLDivElement | null>>([]);
    const glowRef = useRef<HTMLDivElement | null>(null);
    const valueRef = useRef<HTMLDivElement | null>(null);
    const eventRef = useRef<HTMLDivElement | null>(null);

    const energy = clamp(liveStreak, 0, 100);
    const levelCharge = clamp(Math.round((xp / 1000) * 100), 0, 100);
    const momentumTone = getMomentumTone(energy);

    const bars = useMemo(() => {
        const level = (energy / 100) * BAR_COUNT;

        return BAR_HEIGHTS.map((maxHeight, index) => {
            const fill = clamp(level - index, 0, 1);
            const height = 10 + fill * maxHeight;
            const opacity = 0.22 + fill * 0.78;
            const isActive = fill > 0.03;

            return { height, opacity, isActive };
        });
    }, [energy]);

    const compactBars = bars.slice(0, 6);

    useEffect(() => {
        if (collapsed) return;

        const activeBars = barRefs.current.filter(
            (bar): bar is HTMLDivElement => Boolean(bar),
        );
        if (!activeBars.length) return;

        const highlightColor =
            lastStreakDelta >= 0
                ? "rgba(244, 176, 58, 0.42)"
                : "rgba(239, 68, 68, 0.22)";

        const timeline = gsap.timeline({
            defaults: { duration: 0.55, ease: "power3.out" },
        });

        timeline.to(
            activeBars,
            {
                height: (index) => bars[index]?.height ?? 10,
                opacity: (index) => bars[index]?.opacity ?? 0.22,
                y: 0,
                stagger: 0.024,
            },
            0,
        );

        if (glowRef.current) {
            timeline.fromTo(
                glowRef.current,
                { opacity: 0.12 },
                {
                    opacity: 0.34,
                    backgroundColor: highlightColor,
                    duration: 0.28,
                    repeat: 1,
                    yoyo: true,
                },
                0,
            );
        }

        if (valueRef.current) {
            timeline.fromTo(
                valueRef.current,
                { scale: 1 },
                {
                    scale: lastStreakDelta >= 0 ? 1.08 : 0.96,
                    duration: 0.2,
                    repeat: 1,
                    yoyo: true,
                },
                0.06,
            );
        }

        if (eventRef.current) {
            timeline.fromTo(
                eventRef.current,
                { y: 6, opacity: 0.55 },
                { y: 0, opacity: 1, duration: 0.36 },
                0.08,
            );
        }

        return () => {
            timeline.kill();
        };
    }, [bars, collapsed, lastStreakDelta, streakPulseKey]);

    if (collapsed) {
        return (
            <button
                type="button"
                onClick={onToggle}
                className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg mt-2"
            >
                <div className="px-2 py-3 flex items-center justify-between border-t border-border/50 transition-colors hover:bg-secondary/20 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-8 items-center justify-center rounded-full bg-secondary/80 text-accent border border-border/50">
                            <LuFlame className="size-4" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Live Streak
                                </p>
                                <div className="hidden items-end gap-1 min-[430px]:flex">
                                    {compactBars.map((bar, index) => (
                                        <span
                                            key={index}
                                            className={cn(
                                                "w-1.5 rounded-full bg-gradient-to-t",
                                                bar.isActive
                                                    ? "from-status-active via-accent to-xp-streak"
                                                    : "from-border/50 via-border/35 to-border/15",
                                            )}
                                            style={{
                                                height: `${Math.max(8, Math.round(bar.height * 0.45))}px`,
                                                opacity: Math.max(
                                                    0.3,
                                                    bar.opacity,
                                                ),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="mt-0.5 truncate font-sans text-sm font-semibold text-foreground">
                                {momentumTone}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <p className="font-sans text-lg font-bold leading-none text-xp-streak">
                                {streak}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                                {energy}% live
                            </p>
                        </div>
                        <LuChevronDown className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="flex flex-col overflow-hidden transition-all duration-300 mt-2 border-t border-border/50 pt-2">
            <div className="relative px-2 py-2">
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute inset-x-4 bottom-3 top-3 rounded-2xl opacity-0 blur-2xl"
                />

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary/80 text-accent border border-border/50">
                            <LuFlame className="size-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                Live Streak
                            </p>
                            <p className="font-sans text-base font-semibold text-foreground">
                                {momentumTone}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <div ref={valueRef} className="text-right">
                            <div className="font-sans text-xl font-bold leading-none text-xp-streak">
                                {streak}
                            </div>
                            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                                {energy}% live
                            </p>
                        </div>
                        {onToggle ? (
                            <button
                                type="button"
                                onClick={onToggle}
                                aria-label="Collapse live streak"
                                className="flex size-7 items-center justify-center rounded-full transition-colors hover:text-foreground hover:bg-secondary/80 text-muted-foreground ml-1"
                            >
                                <LuChevronUp className="size-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-border/40 bg-secondary/20 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-end justify-between gap-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex h-[60px] max-w-[220px] items-end gap-1">
                                {bars.map((bar, index) => (
                                    <div
                                        key={index}
                                        className="flex h-full flex-1 items-end"
                                    >
                                        <div
                                            ref={(node) => {
                                                barRefs.current[index] = node;
                                            }}
                                            className={cn(
                                                "w-full rounded-t-sm bg-gradient-to-t shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
                                                bar.isActive
                                                    ? "from-status-active via-accent to-xp-streak"
                                                    : "from-border/30 via-border/20 to-border/5",
                                            )}
                                            style={{
                                                height: `${bar.height * 0.8}px`,
                                                opacity: bar.opacity,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                ref={eventRef}
                                className={cn(
                                    "mt-3 inline-flex min-h-7 max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                    lastStreakDelta > 0
                                        ? "border-status-active/30 bg-status-active/10 text-status-active"
                                        : lastStreakDelta < 0
                                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                                          : "border-border/50 bg-secondary/30 text-muted-foreground",
                                )}
                            >
                                {lastStreakDelta > 0 ? (
                                    <LuSparkles className="size-3" />
                                ) : (
                                    <LuActivity className="size-3" />
                                )}
                                <span className="truncate">
                                    {lastStreakEvent}
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Level Charge
                            </p>
                            <p className="mt-1 font-sans text-xl font-bold leading-none text-foreground/90">
                                {levelCharge}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

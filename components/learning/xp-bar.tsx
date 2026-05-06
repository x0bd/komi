"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import {
    LuActivity,
    LuChevronDown,
    LuChevronUp,
    LuSparkles,
} from "react-icons/lu";
import { useLearningStore } from "@/lib/stores/learning-store";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = [18, 24, 30, 22, 36, 28, 42, 32, 48, 36, 54, 42];
const BAR_COUNT = BAR_HEIGHTS.length;

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getMomentumTone(energy: number) {
    if (energy >= 80) return "Sharp shape";
    if (energy >= 60) return "Charging line";
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
    const accentRef = useRef<HTMLDivElement | null>(null);
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
            const opacity = 0.18 + fill * 0.82;
            const isActive = fill > 0.03;

            return { height, opacity, isActive };
        });
    }, [energy]);

    const compactBars = bars.slice(0, 6);

    useEffect(() => {
        if (collapsed) return;

        const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (shouldReduceMotion) return;

        const activeBars = barRefs.current.filter(
            (bar): bar is HTMLDivElement => Boolean(bar),
        );
        if (!activeBars.length) return;

        const timeline = gsap.timeline({
            defaults: { duration: 0.48, ease: "power2.out" },
        });

        timeline.to(
            activeBars,
            {
                height: (index) => bars[index]?.height ?? 10,
                opacity: (index) => bars[index]?.opacity ?? 0.18,
                y: 0,
                stagger: 0.018,
            },
            0,
        );

        if (accentRef.current) {
            timeline.fromTo(
                accentRef.current,
                { scaleX: 0.2, opacity: 0.45, transformOrigin: "left center" },
                { scaleX: 1, opacity: 1, duration: 0.3 },
                0,
            );
        }

        if (valueRef.current) {
            timeline.fromTo(
                valueRef.current,
                { y: lastStreakDelta >= 0 ? 2 : -2 },
                { y: 0, duration: 0.22 },
                0.04,
            );
        }

        if (eventRef.current) {
            timeline.fromTo(
                eventRef.current,
                { y: 4, opacity: 0.55 },
                { y: 0, opacity: 1, duration: 0.28 },
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
                className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="grid grid-cols-[48px_1fr_auto] border border-border bg-background transition-colors hover:bg-subtle">
                    <div className="flex items-center justify-center border-r border-border">
                        <LuActivity className="size-4 text-foreground" />
                    </div>

                    <div className="min-w-0 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                形 / shape
                            </p>
                            <div className="hidden items-end gap-[3px] min-[430px]:flex">
                                {compactBars.map((bar, index) => (
                                    <span
                                        key={index}
                                        className={cn(
                                            "w-1.5",
                                            bar.isActive
                                                ? "bg-foreground"
                                                : "bg-foreground/15",
                                        )}
                                        style={{
                                            height: `${Math.max(8, Math.round(bar.height * 0.36))}px`,
                                            opacity: Math.max(0.28, bar.opacity),
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="mt-1 truncate font-sans text-[17px] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                            {momentumTone}
                        </p>
                        <p className="mt-1 truncate font-sans text-[12px] text-muted-foreground">
                            {lastStreakEvent}
                        </p>
                    </div>

                    <div className="flex items-center border-l border-border">
                        <div className="px-3 text-right">
                            <p className="font-mono text-xl font-semibold leading-none tracking-[-0.08em] text-foreground">
                                {streak}
                            </p>
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                {energy}% live
                            </p>
                        </div>
                        <span className="flex h-full items-center border-l border-border px-3 text-muted-foreground transition-colors group-hover:text-foreground">
                            <LuChevronDown className="size-4" />
                        </span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <section className="mt-2 flex flex-col border border-border bg-background">
            <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center border border-border">
                        <LuActivity className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            形 / shape rhythm
                        </p>
                        <p className="mt-1 font-sans text-[18px] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                            {momentumTone}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div ref={valueRef} className="text-right">
                        <p className="font-mono text-3xl font-semibold leading-none tracking-[-0.08em] text-foreground">
                            {streak}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {energy}% live
                        </p>
                    </div>
                    {onToggle ? (
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-label="Collapse live streak"
                            className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
                        >
                            <LuChevronUp className="size-3.5" />
                        </button>
                    ) : null}
                </div>
            </header>

            <div className="p-4">
                <div className="border border-border bg-subtle/35 p-4">
                    <div className="flex items-end justify-between gap-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex h-[68px] max-w-[240px] items-end gap-1">
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
                                                "w-full",
                                                bar.isActive
                                                    ? "bg-foreground"
                                                    : "bg-foreground/12",
                                                lastStreakDelta > 0 &&
                                                    index === Math.min(BAR_COUNT - 1, Math.floor((energy / 100) * BAR_COUNT)) &&
                                                    "bg-accent",
                                            )}
                                            style={{
                                                height: `${bar.height * 0.82}px`,
                                                opacity: bar.opacity,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                ref={eventRef}
                                className={cn(
                                    "mt-4 inline-flex min-h-8 max-w-full items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                                    lastStreakDelta > 0
                                        ? "border-accent bg-accent text-accent-foreground"
                                        : lastStreakDelta < 0
                                          ? "border-destructive bg-destructive text-destructive-foreground"
                                          : "border-border bg-background text-muted-foreground",
                                )}
                            >
                                {lastStreakDelta > 0 ? (
                                    <LuSparkles className="size-3.5" />
                                ) : (
                                    <LuActivity className="size-3.5" />
                                )}
                                <span className="truncate">{lastStreakEvent}</span>
                            </div>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Level charge
                            </p>
                            <p className="mt-1 font-mono text-3xl font-semibold leading-none tracking-[-0.08em] text-foreground">
                                {levelCharge}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 h-px overflow-hidden bg-border">
                    <div
                        ref={accentRef}
                        className="h-full bg-accent"
                        style={{ width: `${levelCharge}%` }}
                    />
                </div>
            </div>
        </section>
    );
}

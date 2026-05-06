"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LuSparkles } from "react-icons/lu";
import { AIChatPanel } from "@/components/learning/ai-chat-panel";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSenseiFab() {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const labelRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const trigger = triggerRef.current;
        const label = labelRef.current;
        if (!trigger || !label) return;

        const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (shouldReduceMotion) return;

        const tl = gsap.timeline({
            defaults: { duration: 0.24, ease: "power2.out" },
        });

        if (expanded) {
            tl.to(trigger, { width: 164 }, 0);
            tl.to(label, { autoAlpha: 1, x: 0 }, 0.05);
        } else {
            tl.to(label, { autoAlpha: 0, x: -8 }, 0);
            tl.to(trigger, { width: 48 }, 0.05);
        }

        return () => {
            tl.kill();
        };
    }, [expanded]);

    return (
        <div className="fixed bottom-6 left-6 z-40 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                    render={
                        <button
                            ref={triggerRef}
                            type="button"
                            onMouseEnter={() => setExpanded(true)}
                            onMouseLeave={() => setExpanded(false)}
                            onFocus={() => setExpanded(true)}
                            onBlur={() => setExpanded(false)}
                            aria-label="Open Sensei tutor"
                            className="flex h-12 w-12 items-center gap-2 overflow-hidden border border-border bg-background pl-3 pr-4 text-foreground transition-colors hover:bg-subtle"
                        />
                    }
                >
                    <span className="flex size-6 shrink-0 items-center justify-center border-r border-border pr-2">
                        <LuSparkles className="size-[17px]" />
                    </span>
                    <span
                        ref={labelRef}
                        className="invisible -translate-x-2 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.16em] opacity-0"
                    >
                        先生 Sensei
                    </span>
                </SheetTrigger>

                <SheetContent
                    side="bottom"
                    className="h-[min(84svh,680px)] border-t border-border bg-background p-0 [border-radius:0] sm:max-w-none"
                >
                    <SheetHeader className="border-b border-border px-4 py-4 text-left">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            [LIVE COACH]
                        </span>
                        <SheetTitle className="font-sans text-2xl font-semibold tracking-[-0.05em]">
                            先生 Sensei
                        </SheetTitle>
                        <SheetDescription>
                            Live match notes while you play.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="min-h-0 flex-1 overflow-hidden p-4">
                        <AIChatPanel className="h-full" />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

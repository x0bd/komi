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

        const tl = gsap.timeline({
            defaults: { duration: 0.3, ease: "power2.out" },
        });

        if (expanded) {
            tl.to(trigger, { width: 154 }, 0);
            tl.to(label, { autoAlpha: 1, x: 0 }, 0.06);
        } else {
            tl.to(label, { autoAlpha: 0, x: -8 }, 0);
            tl.to(trigger, { width: 48 }, 0.06);
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
                            className="flex h-12 w-12 items-center gap-2 overflow-hidden rounded-none border-2 border-border bg-accent pl-3 pr-4 text-accent-foreground shadow-[4px_4px_0_0_var(--foreground)] transition-colors"
                        />
                    }
                >
                    <span className="flex size-6 shrink-0 items-center justify-center">
                        <LuSparkles className="size-[18px]" />
                    </span>
                    <span
                        ref={labelRef}
                        className="invisible -translate-x-2 whitespace-nowrap text-sm font-semibold opacity-0"
                    >
                        Open Sensei
                    </span>
                </SheetTrigger>

                <SheetContent
                    side="bottom"
                    className="h-[min(84svh,680px)] rounded-none border-t-4 border-border bg-background p-0 sm:max-w-none"
                >
                    <SheetHeader className="pb-3">
                        <SheetTitle className="font-display text-xl">
                            Sensei
                        </SheetTitle>
                        <SheetDescription>
                            Live coaching while you play.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
                        <AIChatPanel className="h-full" />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

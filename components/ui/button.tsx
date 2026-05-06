"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding font-mono text-sm font-medium whitespace-nowrap tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    "border-primary bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90",
                outline:
                    "border-border bg-transparent hover:border-border-strong hover:bg-subtle/60 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
                secondary:
                    "border-border bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
                ghost: "border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
                destructive:
                    "border-destructive bg-destructive text-white hover:bg-destructive/90",
                accent: "border-accent bg-accent text-accent-foreground font-semibold hover:bg-accent/90",
                link: "text-primary underline-offset-4 hover:underline border-transparent",
            },
            size: {
                default:
                    "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
                xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
                icon: "size-9",
                "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant = "default",
    size = "default",
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };

import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
    display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Komi — Play Go Online",
    description:
        "A modern multiplayer Go platform with real-time matches, AI tutoring, and game analysis.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn("light", geist.variable, jetBrainsMono.variable)}
            suppressHydrationWarning
        >
            <body className="min-h-svh bg-background font-sans text-foreground antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

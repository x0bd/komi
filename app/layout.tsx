import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const geistBody = Geist({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

const geistMono = Geist_Mono({
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
            className={cn(
                geistSans.variable,
                geistBody.variable,
                geistMono.variable,
            )}
            suppressHydrationWarning
        >
            <body className="min-h-svh antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

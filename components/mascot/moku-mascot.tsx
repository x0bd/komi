"use client"

import { cn } from "@/lib/utils"
import type { KoMood } from "@/components/mascot/ko-mascot"

export type MokuMood = KoMood

export type MokuMascotProps = {
  mood?: MokuMood
  size?: "sm" | "md" | "lg" | "hero"
  play?: boolean
  className?: string
}

const MOKU_SIZE_CLASS: Record<NonNullable<MokuMascotProps["size"]>, string> = {
  sm: "size-16",
  md: "size-24",
  lg: "size-36",
  hero: "size-44 md:size-56",
}

type MokuExpression = {
  eyeTilt: number
  eyeScale: number
  mouth: "calm" | "smile" | "warn" | "sleep" | "o"
  accent: string
  headTilt: number
  tailTilt: number
  earLift: number
  bodyLift: number
}

function expressionForMood(mood: MokuMood): MokuExpression {
  switch (mood) {
    case "warning":
      return {
        eyeTilt: -4,
        eyeScale: 0.85,
        mouth: "warn",
        accent: "var(--accent)",
        headTilt: -3,
        tailTilt: 8,
        earLift: -1,
        bodyLift: 0,
      }
    case "praise":
    case "happy":
      return {
        eyeTilt: 4,
        eyeScale: 0.35,
        mouth: "smile",
        accent: "var(--signal)",
        headTilt: 2,
        tailTilt: -10,
        earLift: -4,
        bodyLift: -2,
      }
    case "thinking":
    case "review":
    case "teaching":
      return {
        eyeTilt: 0,
        eyeScale: 0.8,
        mouth: "calm",
        accent: "var(--signal)",
        headTilt: -2,
        tailTilt: -3,
        earLift: -2,
        bodyLift: 0,
      }
    case "confused":
      return {
        eyeTilt: 8,
        eyeScale: 0.75,
        mouth: "o",
        accent: "var(--warning)",
        headTilt: 5,
        tailTilt: 4,
        earLift: -1,
        bodyLift: 0,
      }
    case "focused":
      return {
        eyeTilt: -2,
        eyeScale: 0.55,
        mouth: "calm",
        accent: "var(--foreground)",
        headTilt: 0,
        tailTilt: 0,
        earLift: 0,
        bodyLift: 0,
      }
    case "sleep":
      return {
        eyeTilt: 0,
        eyeScale: 0.12,
        mouth: "sleep",
        accent: "var(--muted-foreground)",
        headTilt: 1,
        tailTilt: -4,
        earLift: 0,
        bodyLift: 1,
      }
    case "bow":
      return {
        eyeTilt: 0,
        eyeScale: 0.28,
        mouth: "calm",
        accent: "var(--signal)",
        headTilt: 8,
        tailTilt: -2,
        earLift: 1,
        bodyLift: 2,
      }
    case "blink":
    case "idle":
    default:
      return {
        eyeTilt: 0,
        eyeScale: 0.65,
        mouth: "calm",
        accent: "var(--foreground)",
        headTilt: 0,
        tailTilt: 0,
        earLift: 0,
        bodyLift: 0,
      }
  }
}

export function MokuMascot({
  mood = "idle",
  size = "md",
  play = true,
  className,
}: MokuMascotProps) {
  const expression = expressionForMood(mood)
  const shouldFloat =
    play && ["idle", "thinking", "review", "teaching", "praise", "happy"].includes(mood)
  const shouldAlert = play && mood === "warning"
  const shouldSleep = play && mood === "sleep"

  return (
    <span
      aria-label={`Moku board fox, ${mood}`}
      role="img"
      className={cn("relative inline-block aspect-square select-none", MOKU_SIZE_CLASS[size], className)}
    >
      <svg
        viewBox="0 0 96 96"
        className="size-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="49" cy="84" rx="30" ry="5" fill="var(--foreground)" opacity="0.1" />

        <g transform={`translate(0 ${expression.bodyLift})`}>
          {shouldFloat ? (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -1.8; 0 0"
              dur={mood === "praise" || mood === "happy" ? "0.9s" : "2.6s"}
              repeatCount="indefinite"
              additive="sum"
            />
          ) : null}
          {shouldAlert ? (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 48 55; -2 48 55; 2 48 55; 0 48 55"
              dur="0.45s"
              repeatCount="indefinite"
              additive="sum"
            />
          ) : null}

          <g transform={`rotate(${expression.tailTilt} 70 64)`}>
            <path
              d="M61 66L83 48L78 78L65 73Z"
              fill="var(--stone-white)"
              stroke="var(--foreground)"
              strokeWidth="1.7"
              strokeLinejoin="miter"
            />
            <path
              d="M78 49L83 48L80 64L70 56Z"
              fill="var(--accent)"
              stroke="var(--foreground)"
              strokeWidth="1.5"
              strokeLinejoin="miter"
            />
            <circle cx="76" cy="58" r="2.2" fill="var(--stone-white)" stroke="var(--accent)" strokeWidth="1.2" />
          </g>

          <path
            d="M28 48L48 76L68 48L59 82H37Z"
            fill="var(--stone-white)"
            stroke="var(--foreground)"
            strokeWidth="1.8"
            strokeLinejoin="miter"
          />
          <path
            d="M48 76L38 49H58Z"
            fill="var(--foreground)"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeLinejoin="miter"
          />
          <path d="M48 76V49" stroke="var(--foreground)" strokeOpacity="0.25" strokeWidth="1.2" />
          <path d="M37 82L43 66L48 76" stroke="var(--foreground)" strokeOpacity="0.25" strokeWidth="1.2" />
          <path d="M59 82L53 66L48 76" stroke="var(--foreground)" strokeOpacity="0.25" strokeWidth="1.2" />

          <g transform={`rotate(${expression.headTilt} 48 39)`}>
            <path
              d="M24 17L40 39L31 42Z"
              fill="var(--stone-white)"
              stroke="var(--foreground)"
              strokeWidth="1.8"
              strokeLinejoin="miter"
              transform={`translate(0 ${expression.earLift})`}
            />
            <path
              d="M72 17L56 39L65 42Z"
              fill="var(--stone-white)"
              stroke="var(--foreground)"
              strokeWidth="1.8"
              strokeLinejoin="miter"
              transform={`translate(0 ${expression.earLift})`}
            />
            <path d="M27 20L38 37L31 39Z" fill="var(--foreground)" />
            <path d="M69 20L58 37L65 39Z" fill="var(--foreground)" />
            <path
              d="M31 40L41 30H55L65 40L48 58Z"
              fill="var(--stone-white)"
              stroke="var(--foreground)"
              strokeWidth="1.8"
              strokeLinejoin="miter"
            />
            <path
              d="M31 40L48 58L38 58Z"
              fill="color-mix(in srgb, var(--stone-white) 72%, var(--foreground))"
              opacity="0.26"
            />
            <path
              d="M65 40L48 58L58 58Z"
              fill="color-mix(in srgb, var(--stone-white) 72%, var(--foreground))"
              opacity="0.12"
            />
            <path d="M41 30L48 58L55 30" stroke="var(--foreground)" strokeOpacity="0.24" strokeWidth="1.1" />
            <path
              d="M34 47H43"
              stroke="var(--foreground)"
              strokeWidth="2.4"
              strokeLinecap="square"
              transform={`rotate(${expression.eyeTilt} 38.5 47) scale(1 ${expression.eyeScale})`}
            />
            <path
              d="M53 47H62"
              stroke="var(--foreground)"
              strokeWidth="2.4"
              strokeLinecap="square"
              transform={`rotate(${-expression.eyeTilt} 57.5 47) scale(1 ${expression.eyeScale})`}
            />
            <MokuMouth kind={expression.mouth} accent={expression.accent} />
          </g>

          <path
            d="M57 68L62 77"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinecap="square"
          />
          <path
            d="M61 76L66 72"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinecap="square"
          />
          {shouldSleep ? (
            <text
              x="70"
              y="25"
              fill="var(--muted-foreground)"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fontWeight="700"
            >
              z
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite" />
            </text>
          ) : null}
          {mood === "praise" || mood === "happy" ? (
            <g stroke="var(--signal)" strokeWidth="1.6" strokeLinecap="square">
              <path d="M40 13v-5" />
              <path d="M48 12V6" />
              <path d="M56 13v-5" />
            </g>
          ) : null}
          {mood === "warning" ? (
            <g stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="square">
              <path d="M52 9V3" />
              <path d="M58 11l3-5" />
            </g>
          ) : null}
        </g>
      </svg>
    </span>
  )
}

function MokuMouth({ kind, accent }: { kind: MokuExpression["mouth"]; accent: string }) {
  if (kind === "smile") {
    return <path d="M43 53c3 3 7 3 10 0" stroke={accent} strokeWidth="2" strokeLinecap="square" />
  }
  if (kind === "warn") {
    return <path d="M43 54h10" stroke={accent} strokeWidth="2" strokeLinecap="square" />
  }
  if (kind === "sleep") {
    return <path d="M44 54h8" stroke="var(--foreground)" strokeOpacity="0.5" strokeWidth="1.8" />
  }
  if (kind === "o") {
    return <circle cx="48" cy="54" r="2.6" stroke={accent} strokeWidth="1.8" />
  }
  return <path d="M44 54c2.5 1 5.5 1 8 0" stroke={accent} strokeWidth="1.8" strokeLinecap="square" />
}

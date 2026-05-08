# Komi — AI-Powered Multiplayer Go Platform

**Full-Stack · Real-Time · AI-Integrated · Cloud-Native**

---

## Overview

Komi is a production-grade, full-stack web application that brings the ancient game of Go into the modern era through AI-powered coaching, real-time multiplayer infrastructure, and intelligent game analysis. Built entirely from scratch, the platform integrates multiple third-party AI and cloud services through a clean REST API architecture, demonstrating end-to-end ownership of a complex, multi-system product.

---

## Key Technical Achievements

### AI Integration & Intelligent Coaching
- Integrated **OpenAI GPT-4 Mini** via a custom REST API layer to deliver real-time move analysis and behavioral coaching — narrating move quality, suggesting improvements, and adapting feedback tone based on player performance patterns
- Engineered a **server-side response caching pipeline** (120s TTL, LRU eviction, 300-entry cap) to reduce redundant AI API calls and optimize cost efficiency
- Built a **gamified learning progression system** — XP, streaks, levels, and tutor mood states — that responds dynamically to AI-evaluated game events, reinforcing positive behavioral patterns

### Real-Time System Architecture
- Architected a **live multiplayer synchronization layer** using Liveblocks, managing distributed game state (board, timers, move history, presence indicators) across concurrent clients with sub-second consistency
- Designed custom **presence and connection quality tracking** so players always know their opponent's real-time status and cursor position
- Built room-based matchmaking with server-side access control, room lifecycle management, and graceful fallback for connection failures

### REST API Design & Systems Integration
- Designed and implemented a complete **REST API surface** (Next.js App Router) covering: game persistence, user authentication, AI tutor narration, Liveblocks room auth, and game analytics
- Integrated **three independent cloud platforms** — Neon (serverless PostgreSQL), Liveblocks (real-time infrastructure), and OpenAI — behind a unified application layer with proper error handling, secrets management, and service isolation
- Built a **serverless-safe Prisma ORM layer** with pooled and direct database connections, supporting both runtime queries and schema migrations without cold-start issues

### Custom Game Engine & Data Pipelines
- Authored a **550-line TypeScript rules engine** from scratch implementing full Go game logic: board state management, liberty calculation, capture detection, ko rule enforcement, and territory scoring (Japanese & Chinese rulesets)
- Built an **SGF (Smart Game Format) parser and exporter** for storing and replaying complete game records — enabling a full game history and move-by-move replay system backed by a relational database
- Designed a normalized **PostgreSQL schema** (User → Game → Move) with composite indexes optimized for time-series game history queries and Elo rating tracking

### Dashboard & Operational Visibility
- Developed a **real-time scoring dashboard** with live territory estimation, capture counts, and win-rate indicators updated on every move
- Built a **game history analytics page** with multi-dimensional filtering (result, opponent, date range) and outcome visualization, giving players actionable insight into their performance trends

---

## Stack & Platforms

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| State Management | Zustand (game state, learning progression, multiplayer) |
| Real-Time | Liveblocks (presence, synchronized storage, room events) |
| AI / LLM | OpenAI API (GPT-4 Mini, server-side with caching) |
| Database | Neon Serverless PostgreSQL + Prisma ORM |
| Authentication | Neon Auth (session-cookie based, server-side verified) |
| Cloud | Vercel-compatible serverless deployment |
| Testing | Vitest (game engine unit tests) |

---

## Relevance to AI Fullstack Development

Komi directly demonstrates the skills required for modern AI engineering roles:

- **API integration across heterogeneous systems** — wired together auth, database, real-time sync, and LLM services into a coherent product
- **AI-powered behavioral tooling** — the tutor system coaches players move-by-move, adapting feedback to performance, mirroring the structure of enterprise AI coaching and compliance tools
- **Real-time operational dashboards** — live score cards, presence indicators, and connection health monitoring built for production use
- **Data pipeline design** — move validation, deduplication via ko-rule history tracking, and structured game record storage
- **Cloud-native architecture** — serverless database connections, distributed state management, and stateless API design ready for horizontal scaling
- **Security at system boundaries** — session-verified API routes, Liveblocks room access tokens, environment-isolated secrets, and strict input validation on all endpoints

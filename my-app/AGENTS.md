# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DevEvent is a Next.js 16 event discovery platform ("The Hub for Every Dev Event You Can't Miss") built with the App Router, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui. Events are currently stored as static data in `lib/constant.ts`. PostHog is integrated for analytics.

## Commands

- **Dev server:** `npm run dev` (runs on http://localhost:3000)
- **Build:** `npm run build`
- **Start production:** `npm run start`
- **Lint:** `npm run lint` (uses ESLint 9 flat config with `eslint-config-next`)

There are no test scripts configured.

## Architecture

### Routing (App Router)

All routes are under `app/` using Next.js App Router conventions:

- `/` — Homepage with hero section and featured event cards (`app/page.tsx`)
- `/Events` — Events listing page (stub, `app/Events/page.tsx`)
- `/CreateEvent` — Create event page (stub, `app/CreateEvent/page.tsx`)

### Layout

`app/layout.tsx` is the root layout. It renders the `Navbar` and `LightRays` (WebGL background effect using OGL) globally, wrapping all page content in `<main>`.

Fonts: Schibsted Grotesk (primary) and Martian Mono (monospace), loaded via `next/font/google` and exposed as CSS variables `--font-schibsted-grotesk` and `--font-martian-mono`.

### Components

Custom components live in `component/` (singular, not `components/`):

- **Navbar** — Sticky glass-morphism nav bar with PostHog click tracking
- **EventCard** — Displays event poster, location, title, date/time; tracks clicks via PostHog
- **ExploreBtn** — CTA button with PostHog tracking
- **LightRays** — WebGL shader-based animated light rays background (OGL library); configurable via props

shadcn/ui is configured (`components.json`) but components install to `components/ui/` (note: different directory from custom `component/`).

### Styling

- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- Custom CSS utilities defined in `app/globals.css`: `flex-center`, `text-gradient`, `glass`, `card-shadow`
- Custom color tokens: `--color-blue`, `--color-light-100/200`, `--color-dark-100/200`, `--color-border-dark`, `--primary` (#59deca)
- Component-level styles use `@layer components` blocks scoped by element IDs (`#event-card`, `#explore-btn`, `#event`, `#book-event`)

### Data

Event data is hardcoded in `lib/constant.ts` as an exported `events` array. Each event has: `slug`, `image`, `title`, `location`, `date`, `time`.

### Analytics (PostHog)

PostHog is initialized client-side in `instrumentation-client.ts` using a reverse-proxy pattern (requests routed through `/ingest/*` via `next.config.ts` rewrites). Events tracked: `event_card_clicked`, `explore_events_clicked`, `nav_link_clicked`.

### Path Aliases

`@/*` maps to the project root (e.g., `@/component/Navbar`, `@/lib/utils`).

## Key Conventions

- Client components must include `'use client'` directive at the top
- The `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) should be used for conditional class merging
- Static assets (icons, images) are stored in `public/`
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

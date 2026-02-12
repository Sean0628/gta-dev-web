# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GTA Tech Meetups — a React + TypeScript web app for discovering tech meetups and events in the Greater Toronto Area. Data is stored in Supabase and kept current by automated web scrapers running daily via GitHub Actions.

## Commands

```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Production build (output: dist/)
npm run lint             # ESLint
npm run preview          # Preview production build locally
npm run scrape:meetups   # Scrape meetup group info into Supabase
npm run scrape:events    # Scrape upcoming events into Supabase
```

Scrapers require `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`. Use `DRY_RUN=true` to log without writing to the database.

## Architecture

### Frontend (src/)

Single-page React 18 app with no router library — navigation between "meetups" and "events" views is handled via `useState` in `App.tsx`. Styling uses Tailwind CSS with class-based dark mode.

- **App.tsx** — Root component: fetches meetups from Supabase, manages view state and theme
- **pages/Events.tsx** — Fetches future events from Supabase (filtered by `datetime >= now`), joins meetup logos
- **components/** — `MeetupGrid`, `MeetupCard`, `EventList`, `ThemeToggle`
- **data/meetups.ts** — Central registry of all meetup sources (`MeetupSource[]`). Each source has `url`, `platform` ("meetup" | "other"), and `type` ("meetups" | "others"). Add new groups here.
- **lib/supabase.ts** — Supabase client (uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- **lib/theme.ts** — Theme persistence (localStorage) with system preference detection

### Scrapers (scripts/)

Two scraper scripts, both creating their own Supabase client with the service role key:

- **scrape-meetups.ts** — Uses **Cheerio** (HTML parsing, no browser). Scrapes group name, description, and logo. Has platform-specific selectors for Meetup.com, Toronto Ruby, and Builder Sundays.
- **scrape-events.ts** — Uses **Puppeteer** with stealth plugin (for JS-rendered pages). Scrapes event title, datetime, venue, description, link. Has separate functions for Meetup.com and Toronto Ruby. Events are upserted on the `link` column (unique constraint).

Adding a new scraper source: add the URL to `src/data/meetups.ts`, then add site-specific scraping logic in the relevant script if it's not a Meetup.com group.

### Database (Supabase)

Two tables with RLS (public read, service role write):

- **meetups** — `id`, `url` (unique), `platform`, `type`, `name`, `logo`, `description`, `last_scraped_at`
- **events** — `id`, `meetup_id` (FK), `title`, `datetime`, `venue`, `description`, `logo`, `link` (unique)

Migrations live in `supabase/migrations/`.

### CI/CD

- **GitHub Actions** (`.github/workflows/scheduled-scrape.yml`): runs `scrape:meetups` then `scrape:events` daily at 5 AM ET
- **Vercel**: hosts the frontend, auto-deploys from the repo

## Key Technical Details

- TypeScript strict mode is enabled (`tsconfig.app.json`)
- All event datetimes are stored in UTC; displayed in America/Toronto timezone using `date-fns-tz`
- Puppeteer scraper has a 60s navigation timeout and uses user-agent spoofing for Meetup.com
- Environment variables: `VITE_`-prefixed vars are exposed to the frontend; `SUPABASE_SERVICE_ROLE_KEY` is server-side only (scrapers)

# GTA Tech Meetups

This repository aims to list all tech-related meetups, user groups, and similar communities happening in the Greater Toronto Area (GTA). The project provides a centralized platform to discover and track various tech communities in the region.

Contributions Welcome! If you know of a meetup or user group that isn't listed, feel free to open a PR and add it.

## Features

- 📅 Comprehensive list of tech meetups in GTA
- 🎯 Focus on active communities

## Tech Stack

- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for database and authentication
- Cheerio for web scraping

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Sean0628/gta-tech-meetups.git
cd gta-tech-meetups
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The application is deployed using Vercel. Here's how to deploy:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project to Vercel:
```bash
vercel link
```

3. Add environment variables in Vercel:
   - Go to your project settings in Vercel
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. Deploy:
```bash
vercel --prod
```

Vercel will automatically:
- Detect it's a Vite project
- Install dependencies
- Run the build command
- Deploy to production

## Data Management

### Adding New Meetups

To add a new meetup:

1. Open `src/data/meetups.ts`
2. Add a new entry to the `meetupSources` array:

```typescript
export const meetupSources: MeetupSource[] = [
  {
    url: "https://www.meetup.com/your-meetup-group/",
    platform: "meetup", // or "other"
    type: "meetups", // or "others"
  }
];
```

Supported platforms:
- `meetup`: Meetup.com groups
- `other`: Custom websites/platforms

Types:
- `meetups`: Regular meetup groups
- `others`: Other tech communities or events

### Scraping Process

The project includes an automated scraper to keep meetup information up-to-date:

1. Run the scraper:
```bash
npm run scrape
npm run scrape:meetups // Run meetup scraping
npm run scrape:events  // Run event scraping
```

The scraper will:
- Check for new meetups in `meetupSources`
- Update existing meetup information
- Store logos and descriptions
- Track last scrape time

To customize scraping for a new platform:
1. Add the platform's URL pattern to `scrapeMeetupPage()` in `scripts/*`
2. Implement the scraping logic using Cheerio selectors
3. Return the scraped data in the standard format

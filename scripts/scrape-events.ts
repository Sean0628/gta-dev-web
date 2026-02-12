import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import { parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

puppeteer.use(StealthPlugin());

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDryRun = process.env.DRY_RUN === 'true';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function scrapeEventsFromTorontoRuby(url: string, meetupId: string) {
  try {
    console.log(`Opening browser for Toronto Ruby site: ${url}...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log(`Page loaded: ${url}`);

    // Extract event details
    const events = await page.evaluate((meetupId) => {
      return [...document.querySelectorAll('div[id^="event_"]')].map(event => {
        const rawDate = event.querySelector('span.font-medium')?.innerText.trim() || 'No datetime found';
        const linkPath = event.querySelector('h2 a')?.getAttribute('href');
        return {
        meetup_id: meetupId,
        title: event.querySelector('h2 a')?.innerText.trim() || 'No title found',
        datetime: rawDate,
        venue: event.querySelector('.trix-content')?.innerText.trim() || 'No venue found',
        description: event.querySelectorAll('.trix-content')[1]?.innerText.trim() || 'No description',
        logo: null,
        link: linkPath ? `https://toronto-ruby.com${linkPath}` : null,
      };
      });
    }, meetupId);


    await browser.close();
    // Format datetime
    const parsedEvents = events.map(event => {
        const parsedLocal = parse(event.datetime, "MMM dd, yyyy '@' hh:mmaaa", new Date());
        const utcDate = fromZonedTime(parsedLocal, 'America/Toronto');
        event.datetime = utcDate.toISOString();
        return event;
    });

    console.log(`Found ${parsedEvents.length} events for Toronto Ruby:`, parsedEvents);

    return parsedEvents;
  } catch (error) {
    console.error(`Error scraping events from Toronto Ruby:`, error);
    return [];
  }
}

async function scrapeEventsFromAITinkerers(url: string, meetupId: string) {
  try {
    console.log(`Fetching AI Tinkerers page: ${url}...`);
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Extract events from JSON-LD structured data
    const jsonLdScripts = $('script[type="application/ld+json"]');
    const events: any[] = [];

    jsonLdScripts.each((_, el) => {
      try {
        const schema = JSON.parse($(el).html() || '');
        const items = schema?.itemListElement || [];
        for (const entry of items) {
          const item = entry?.item;
          if (!item || item['@type'] !== 'Event') continue;

          const venue = item.location;
          const venueParts = [venue?.name, venue?.address?.streetAddress, venue?.address?.addressLocality].filter(Boolean);

          events.push({
            meetup_id: meetupId,
            title: item.name ?? 'No title found',
            datetime: item.startDate ?? 'No datetime found',
            venue: venueParts.length > 0 ? venueParts.join(', ') : 'No venue found',
            description: item.description ?? 'No description',
            logo: item.image ?? null,
            link: item.url ?? null,
          });
        }
      } catch { /* ignore malformed JSON-LD */ }
    });

    console.log(`Found ${events.length} events for AI Tinkerers`);
    console.log('All Extracted Events:', events);

    return events;
  } catch (error) {
    console.error(`Error scraping events from AI Tinkerers:`, error);
    return [];
  }
}

async function scrapeEventsFromMeetup(url: string, meetupId: string) {
  try {
    // Ensure we hit the /events/ page
    const eventsUrl = url.endsWith('/') ? `${url}events/` : `${url}/events/`;
    console.log(`Fetching events page: ${eventsUrl}...`);

    const response = await fetch(eventsUrl);
    const html = await response.text();
    const $ = load(html);

    // Extract __APOLLO_STATE__ from __NEXT_DATA__ script tag
    const nextDataScript = $('script#__NEXT_DATA__').html();
    if (!nextDataScript) {
      console.warn(`Could not find __NEXT_DATA__ for ${eventsUrl}`);
      return [];
    }

    const nextData = JSON.parse(nextDataScript);
    const apolloState = nextData?.props?.pageProps?.__APOLLO_STATE__;
    if (!apolloState) {
      console.warn(`Could not extract Apollo state from ${eventsUrl}`);
      return [];
    }

    // Find all Event objects in Apollo state
    const events = Object.keys(apolloState)
      .filter(key => key.startsWith('Event:'))
      .map(key => {
        const event = apolloState[key];

        // Resolve venue reference
        let venue = 'No venue found';
        const venueRef = event.venue?.__ref ?? event.venue?.id;
        if (venueRef && apolloState[venueRef]) {
          const v = apolloState[venueRef];
          venue = [v.name, v.address, v.city].filter(Boolean).join(', ');
        } else if (event.venue?.name) {
          venue = [event.venue.name, event.venue.address, event.venue.city].filter(Boolean).join(', ');
        }

        // Resolve photo reference
        let logo: string | null = null;
        const photoRef = event.featuredEventPhoto?.__ref ?? event.imageUrl;
        if (photoRef && apolloState[photoRef]) {
          logo = apolloState[photoRef].highResUrl ?? apolloState[photoRef].source ?? null;
        } else if (event.featuredEventPhoto?.highResUrl) {
          logo = event.featuredEventPhoto.highResUrl;
        }

        return {
          meetup_id: meetupId,
          title: event.title ?? 'No title found',
          datetime: event.dateTime ?? 'No datetime found',
          venue,
          description: event.description ?? 'No description',
          logo,
          link: event.eventUrl ?? null,
        };
      });

    console.log(`Found ${events.length} events for ${url}`);
    console.log('All Extracted Events:', events);

    return events;
  } catch (error) {
    console.error(`Error scraping events from ${url}:`, error);
    return [];
  }
}

async function main() {
  console.log(`Starting event scraper... ${isDryRun ? '(Dry Run)' : ''}`);

  // Get all meetups
  const { data: meetups, error: meetupsError } = await supabase
    .from('meetups')
    .select('id, url');

  if (meetupsError) {
    console.error('Error fetching meetups:', meetupsError);
    return;
  }

  const results = [];

  for (const meetup of meetups) {
    console.log(`Scraping events for meetup ${meetup.url}...`);
    
    try {
      let events = [];

      if (meetup.url.includes('meetup.com')) {
        events = await scrapeEventsFromMeetup(meetup.url, meetup.id);
      } else if (meetup.url.includes('toronto-ruby.com')) {
        events = await scrapeEventsFromTorontoRuby(meetup.url, meetup.id);
      } else if (meetup.url.includes('aitinkerers.org')) {
        events = await scrapeEventsFromAITinkerers(meetup.url, meetup.id);
      } else {
        console.log(`Skipping unknown website: ${meetup.url}`);
        continue;
      }
      if (events.length > 0) {
        if (!isDryRun) {
          const { error } = await supabase
            .from('events')
            .upsert(events, {
              onConflict: 'link'
            });

          if (error) {
            throw error;
          }
        }

        results.push({
          meetupUrl: meetup.url,
          eventsFound: events.length,
          success: true
        });

        console.log(`${isDryRun ? '(Dry Run) Would update' : 'Updated'} ${events.length} events for ${meetup.url}`);
      } else {
        results.push({
          meetupUrl: meetup.url,
          eventsFound: 0,
          success: true
        });
      }
    } catch (error) {
      console.error(`Error processing ${meetup.url}:`, error);
      results.push({
        meetupUrl: meetup.url,
        eventsFound: 0,
        success: false,
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\nScraping Summary:');
  console.log('----------------');
  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    const details = result.success
      ? `${result.eventsFound} events found`
      : `Failed: ${result.error}`;
    console.log(`${status} ${result.meetupUrl}: ${details}`);
  });

  console.log('\nEvent scraping completed');
}

main()
  .then(() => {
    console.log('Scraping completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during scraping:', error);
    process.exit(1);
  });

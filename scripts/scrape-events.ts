import { createClient } from '@supabase/supabase-js';
import { parse } from 'date-fns';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

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
        const rawDate = event.querySelector('p')?.innerText.trim() || 'No datetime found';
        return {
        meetup_id: meetupId,
        title: event.querySelector('h2 a')?.innerText.trim() || 'No title found',
        datetime: rawDate,
        venue: event.querySelector('.trix-content')?.innerText.trim() || 'No venue found',
        description: event.querySelector('.ml-4 .trix-content')?.innerText.trim() || 'No description',
        logo: null,
        link: event.querySelector('a.rounded-full')?.href || null,
      };
      });
    }, meetupId);


    await browser.close();
    // Format datetime
    const parsedEvents = events.map(event => {
        const parsedDate = parse(event.datetime, "MMM dd, yyyy '@' hh:mmaaa", new Date());
        event.datetime = parsedDate.toISOString();
        return event;
    });

    console.log(`Found ${parsedEvents.length} events for Toronto Ruby:`, parsedEvents);

    return parsedEvents;
  } catch (error) {
    console.error(`Error scraping events from Toronto Ruby:`, error);
    return [];
  }
}

async function scrapeEventsFromMeetup(url: string, meetupId: string) {
  try {
    console.log(`Opening browser for ${url}...`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set headers to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log(`Page loaded: ${url}`);

    // Extract content
    const events = await page.evaluate((meetupId) => {
      return [...document.querySelectorAll('a[id^="event-card"]')].map(event => {
        const eventData = {
          meetup_id: meetupId,
          title: event.querySelector('.utils_cardTitle__sAAHG')?.innerText.trim() || 'No title found',
          datetime: event.querySelector('time')?.innerText.trim() || 'No datetime found',
          venue: event.querySelector('span.text-gray6')?.innerText.trim() || 'No venue found',
          description: event.closest('li')?.querySelector('.utils_cardDescription__1Qr0x')?.innerText.trim() || 'No description',
          logo: event.closest('li')?.querySelector('img.aspect-video')?.src || null,
          link: event.href.startsWith('http') ? event.href : `https://www.meetup.com${event.getAttribute('href')}`,
        };
        return eventData;
      });
    }, meetupId);

    console.log(`Found ${events.length} events for ${url}`);
    console.log('All Extracted Events:', events);

    await browser.close();
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import dotenv from 'dotenv';
import { meetupSources } from '../src/data/meetups';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.env.DRY_RUN === 'true';

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

function extractApolloState(html: string): Record<string, any> | null {
  const $ = load(html);
  const nextDataScript = $('script#__NEXT_DATA__').html();
  if (!nextDataScript) return null;
  try {
    const nextData = JSON.parse(nextDataScript);
    return nextData?.props?.pageProps?.__APOLLO_STATE__ ?? null;
  } catch {
    return null;
  }
}

function scrapeMeetupFromApollo(apolloState: Record<string, any>) {
  const groupKey = Object.keys(apolloState).find(k => k.startsWith('Group:'));
  if (!groupKey) return {};

  const group = apolloState[groupKey];
  const name = group?.name ?? '';
  const description = group?.description ?? '';

  let logo: string | null = null;
  const photoRef = group?.keyGroupPhoto?.__ref ?? group?.keyGroupPhoto?.id;
  if (photoRef && apolloState[photoRef]) {
    logo = apolloState[photoRef].highResUrl ?? apolloState[photoRef].source ?? null;
  }

  return { name, description, logo };
}

async function scrapeMeetupPage(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    if (url.includes('meetup.com')) {
      const apolloState = extractApolloState(html);
      if (apolloState) {
        return scrapeMeetupFromApollo(apolloState);
      }
      console.warn(`Could not extract Apollo state from ${url}`);
      return {};
    }

    const $ = load(html);

    if (url.includes('toronto-ruby.com')) {
      const logoUrl = $('img[alt="Toronto Ruby"]').first().attr('src');
      const fullLogoUrl = logoUrl ? new URL(logoUrl, url).href : null;
      const description = $('meta[property="og:description"]').attr('content')?.trim() || $('p').first().text().trim();
      const name = 'Toronto Ruby';
      return { name, description, logo: fullLogoUrl };
    } else if (url.includes('builder-sundays') || url.includes('buildersundays')) {
      const name = $('img[alt="Builder Sundays"]').attr('alt') || 'Builder Sundays';
      const description = $('div[class*="rich_text"] p').map((_, el) => $(el).text().trim()).get().join('\n\n');
      const logoUrl = $('img[alt="Builder Sundays"]').attr('src');
      const fullLogoUrl = logoUrl ? new URL(logoUrl, url).href : null;
      const locations = $('.multicolumn__item').map((_, el) => {
        const title = $(el).find('h3').text().trim();
        const address = $(el).find('p a').first().text().trim();
        return `${title}: ${address}`;
      }).get().join('\n');
      const fullDescription = locations ? `${description}\n\nLocations:\n${locations}` : description;
      return { name, description: fullDescription, logo: fullLogoUrl };
    }
    return {};
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {};
  }
}

async function main() {
  console.log('Starting scraper...');

  for (const source of meetupSources) {
    console.log(`Processing ${source.url}...`);

    const { data: existingMeetup } = await supabase
      .from('meetups')
      .select('id')
      .eq('url', source.url)
      .single();

    const scrapedData = await scrapeMeetupPage(source.url);

    if (existingMeetup) {
      console.log(`Would update meetup: ${source.url}`, scrapedData);
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('meetups')
          .update({
            ...scrapedData,
            last_scraped_at: new Date().toISOString(),
          })
          .eq('id', existingMeetup.id);
        if (error) {
          console.error(`Error updating meetup ${source.url}:`, error);
        } else {
          console.log(`Updated meetup ${source.url}`);
        }
      }
    } else {
      console.log(`Would insert new meetup: ${source.url}`, scrapedData);
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('meetups')
          .insert({
            ...source,
            ...scrapedData,
            last_scraped_at: new Date().toISOString(),
          });
        if (error) {
          console.error(`Error inserting meetup ${source.url}:`, error);
        } else {
          console.log(`Inserted new meetup ${source.url}`);
        }
      }
    }
  }
  console.log('Scraping completed');
}

main().catch(console.error);

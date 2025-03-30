import { createClient } from '@supabase/supabase-js';
import { load } from 'cheerio';
import dotenv from 'dotenv';
import { meetupSources } from '../src/data/meetups';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

async function scrapeMeetupPage(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    if (url.includes('meetup.com')) {
      return {
        name: $('.ds-font-title-1').first().text().trim(),
        description: $('.utils_description__BlOCA').first().text().trim(),
        logo: $('.aspect-video.w-full.object-cover.object-center.md\\:rounded-lg').first().attr('src'),
      };
    } else if (url.includes('toronto-ruby.com')) {
      const logoUrl = $('.mx-auto.max-w-\\[16rem\\].h-auto').first().attr('src');
      const fullLogoUrl = logoUrl ? new URL(logoUrl, url).href : null;
      const description = $('meta[name="description"]').attr('content') || $('p').first().text().trim();
      const name = $('title').text().trim() || $('.text-ruby').first().text().trim() || 'Toronto Ruby';
      return { name, description, logo: fullLogoUrl };
    } else if (url.includes('builder-sundays.myshopify.com')) {
      const name = $('.header__heading-logo').attr('alt') || $('h1.header__heading').text().trim() || 'Builder Sundays';
      const description = $('.rich-text__text.rte').map((_, el) => $(el).text().trim()).get().join('\n\n');
      const logoUrl = $('.header__heading-logo').attr('src');
      const fullLogoUrl = logoUrl ? new URL(logoUrl, url).href : null;
      const locations = $('.multicolumn-card__info').map((_, el) => {
        const title = $(el).find('h3').text().trim();
        const address = $(el).find('.rte p a').first().text().trim();
        return `${title}: ${address}`;
      }).get().join('\n');
      const fullDescription = `${description}\n\nLocations:\n${locations}`;
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

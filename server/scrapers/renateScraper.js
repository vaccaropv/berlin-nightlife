import puppeteer from 'puppeteer';

/**
 * Scrapes upcoming events from Renate website
 * @returns {Promise<Array>} Array of event objects
 */
export async function scrapeRenateEvents() {
    console.log('🎵 Scraping Renate events...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        // Navigate to Renate events page
        await page.goto('https://www.renate.cc', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for events to load
        await page.waitForSelector('.event, .program, article, .party', { timeout: 10000 }).catch(() => {
            console.log('No event items found with standard selectors');
        });

        // Extract event data
        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.event, .program, article, .party, .upcoming');
            const results = [];

            eventElements.forEach((element, index) => {
                if (index >= 10) return; // Limit to 10 events

                try {
                    // Try to extract title
                    const titleEl = element.querySelector('h1, h2, h3, .title, .event-title, .party-name');
                    const title = titleEl?.textContent?.trim() || 'Event at Renate';

                    // Try to extract date
                    const dateEl = element.querySelector('.date, .event-date, time, .datum');
                    const dateText = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '';

                    // Try to extract lineup
                    const lineupEl = element.querySelector('.lineup, .artists, .djs, .acts');
                    const lineupText = lineupEl?.textContent?.trim() || '';
                    const lineup = lineupText.split(/,|\n|\/|\|/).map(dj => dj.trim()).filter(Boolean);

                    // Try to extract time
                    const timeEl = element.querySelector('.time, .event-time, .uhrzeit');
                    const time = timeEl?.textContent?.trim() || '';

                    // Try to extract link
                    const linkEl = element.querySelector('a');
                    const link = linkEl?.href || '';

                    if (title && dateText) {
                        results.push({
                            id: `renate-${Date.now()}-${index}`,
                            venueId: 'renate',
                            title,
                            date: dateText,
                            lineup: lineup.length > 0 ? lineup : ['TBA'],
                            startTime: time || '23:00',
                            endTime: 'Late',
                            price: 12,
                            currency: '€',
                            raLink: link || 'https://www.renate.cc'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            });

            return results;
        });

        console.log(`✅ Found ${events.length} Renate events`);
        return events;

    } catch (error) {
        console.error('❌ Error scraping Renate:', error.message);
        // Return fallback mock data
        return [{
            id: 'renate-fallback-1',
            venueId: 'renate',
            title: 'Renate Event (Scraping Error)',
            date: new Date().toISOString(),
            lineup: ['Check renate.cc for details'],
            startTime: '23:00',
            endTime: 'Late',
            price: 12,
            currency: '€',
            raLink: 'https://www.renate.cc'
        }];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

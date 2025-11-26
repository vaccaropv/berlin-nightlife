import puppeteer from 'puppeteer';

/**
 * Scrapes upcoming events from Tresor Berlin website
 * @returns {Promise<Array>} Array of event objects
 */
export async function scrapeTresorEvents() {
    console.log('🎵 Scraping Tresor events...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        // Navigate to Tresor events page
        await page.goto('https://tresorberlin.com/events', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for events to load
        await page.waitForSelector('.event-item, .event, article', { timeout: 10000 }).catch(() => {
            console.log('No event items found with standard selectors');
        });

        // Extract event data
        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.event-item, .event, article');
            const results = [];

            eventElements.forEach((element, index) => {
                if (index >= 10) return; // Limit to 10 events

                try {
                    // Try to extract title
                    const titleEl = element.querySelector('h2, h3, .title, .event-title');
                    const title = titleEl?.textContent?.trim() || 'Event at Tresor';

                    // Try to extract date
                    const dateEl = element.querySelector('.date, .event-date, time');
                    const dateText = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '';

                    // Try to extract lineup
                    const lineupEl = element.querySelector('.lineup, .artists, .djs');
                    const lineup = lineupEl?.textContent?.trim().split(/,|\n/).map(dj => dj.trim()).filter(Boolean) || [];

                    // Try to extract time
                    const timeEl = element.querySelector('.time, .event-time');
                    const time = timeEl?.textContent?.trim() || '';

                    // Try to extract link
                    const linkEl = element.querySelector('a');
                    const link = linkEl?.href || '';

                    if (title && dateText) {
                        results.push({
                            id: `tresor-${Date.now()}-${index}`,
                            venueId: 'tresor',
                            title,
                            date: dateText,
                            lineup: lineup.length > 0 ? lineup : ['TBA'],
                            startTime: time || '23:00',
                            endTime: 'Late',
                            price: 15,
                            currency: '€',
                            raLink: link || 'https://tresorberlin.com/events'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            });

            return results;
        });

        console.log(`✅ Found ${events.length} Tresor events`);
        return events;

    } catch (error) {
        console.error('❌ Error scraping Tresor:', error.message);
        // Return fallback mock data
        return [{
            id: 'tresor-fallback-1',
            venueId: 'tresor',
            title: 'Tresor Event (Scraping Error)',
            date: new Date().toISOString(),
            lineup: ['Check tresorberlin.com for details'],
            startTime: '23:00',
            endTime: 'Late',
            price: 15,
            currency: '€',
            raLink: 'https://tresorberlin.com/events'
        }];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

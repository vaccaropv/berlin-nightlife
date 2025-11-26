import puppeteer from 'puppeteer';

/**
 * Scrapes upcoming events from Berghain website
 * @returns {Promise<Array>} Array of event objects
 */
export async function scrapeBerghainEvents() {
    console.log('🎵 Scraping Berghain events...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        // Navigate to Berghain program page
        await page.goto('https://www.berghain.berlin/en/program/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for events to load
        await page.waitForSelector('.event, .program-item, article', { timeout: 10000 }).catch(() => {
            console.log('No event items found with standard selectors');
        });

        // Extract event data
        const events = await page.evaluate(() => {
            const eventElements = document.querySelectorAll('.event, .program-item, article');
            const results = [];

            eventElements.forEach((element, index) => {
                if (index >= 10) return; // Limit to 10 events

                try {
                    // Try to extract title
                    const titleEl = element.querySelector('h2, h3, .title, .event-title');
                    const title = titleEl?.textContent?.trim() || 'Event at Berghain';

                    // Try to extract date
                    const dateEl = element.querySelector('.date, .event-date, time');
                    const dateText = dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '';

                    // Try to extract lineup
                    const lineupEl = element.querySelector('.lineup, .artists, .djs');
                    const lineupText = lineupEl?.textContent?.trim() || '';
                    const lineup = lineupText.split(/,|\n|\//).map(dj => dj.trim()).filter(Boolean);

                    // Try to extract time
                    const timeEl = element.querySelector('.time, .event-time');
                    const time = timeEl?.textContent?.trim() || '';

                    // Try to extract link
                    const linkEl = element.querySelector('a');
                    const link = linkEl?.href || '';

                    if (title && dateText) {
                        results.push({
                            id: `berghain-${Date.now()}-${index}`,
                            venueId: 'berghain',
                            title,
                            date: dateText,
                            lineup: lineup.length > 0 ? lineup : ['TBA'],
                            startTime: time || '00:00',
                            endTime: 'Late',
                            price: 20,
                            currency: '€',
                            raLink: link || 'https://www.berghain.berlin/en/program/'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing event:', err);
                }
            });

            return results;
        });

        console.log(`✅ Found ${events.length} Berghain events`);
        return events;

    } catch (error) {
        console.error('❌ Error scraping Berghain:', error.message);
        // Return fallback mock data
        return [{
            id: 'berghain-fallback-1',
            venueId: 'berghain',
            title: 'Berghain Event (Scraping Error)',
            date: new Date().toISOString(),
            lineup: ['Check berghain.berlin for details'],
            startTime: '00:00',
            endTime: 'Late',
            price: 20,
            currency: '€',
            raLink: 'https://www.berghain.berlin/en/program/'
        }];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

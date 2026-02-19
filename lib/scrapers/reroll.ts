import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class RerollScraper implements Scraper {
    name = 'Reroll';

    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('RerollScraper: Failed to launch browser', error);
            return [];
        }

        const results: SearchResult[] = [];
        let page;

        try {
            page = await browser.newPage();
            console.log('RerollScraper: Navigating to homepage...');

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Clear cookies to avoid issues with shared browser state
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');

            await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

            // Set value explicitly and submit form by clicking the button
            console.log(`RerollScraper: Searching for "${query}"...`);
            await page.type('.search_input', query);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
                page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('a, button, input[type="submit"]'));
                    const searchBtn = buttons.find(b => b.textContent?.trim() === 'Hledat');
                    if (searchBtn) {
                        (searchBtn as HTMLElement).click();
                    } else {
                        // Fallback: try to submit form if found, or press enter
                        const form = document.querySelector('form');
                        if (form) form.submit();
                    }
                })
            ]);

            // Wait for products to load
            try {
                console.log('RerollScraper: Waiting for products...');
                await page.waitForSelector('.p_cart_block', { timeout: 10000 });
                console.log('RerollScraper: Products found at', page.url());
            } catch (e) {
                console.log('RerollScraper: Timeout waiting for products at', page.url());
            }

            const productElements = await page.$$('.p_cart_block');
            console.log(`RerollScraper: Found ${productElements.length} elements.`);

            for (const element of productElements) {
                try {
                    const nameEl = await element.$('.p_title a span[itemprop="name"]');
                    const name = nameEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', nameEl) : '';

                    const priceEl = await element.$('.p_price');
                    const priceText = priceEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', priceEl) : '';
                    const price = this.parsePrice(priceText);

                    const linkEl = await element.$('.p_title a');
                    const link = linkEl ? await page.evaluate((el: any) => el.getAttribute('href') || '', linkEl) : '';

                    const imageEl = await element.$('.p_img img');
                    const imageUrl = imageEl ? await page.evaluate((el: any) => el.getAttribute('src') || '', imageEl) : '';

                    // Check availability
                    // Look for "Nesehnatelné" label
                    const labelEl = await element.$('.p_label_green');
                    const labelText = labelEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', labelEl) : '';
                    const isAvailable = !labelText.includes('Nesehnatelné');

                    if (name && price > 0) {
                        results.push({
                            name,
                            price,
                            currency: 'CZK',
                            availability: isAvailable ? 'Skladem' : 'Není skladem',
                            link: link.startsWith('http') ? link : `https://www.reroll.cz${link}`,
                            imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.reroll.cz${imageUrl}`,
                            shopName: 'Reroll'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing Reroll product:', err);
                }
            }
        } catch (error) {
            console.error('Error scraping Reroll:', error);
        } finally {
            if (page) await page.close();
            // Do NOT close browser as it is a shared singleton
        }

        return results;
    }

    private parsePrice(priceText: string): number {
        return parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
    }
}

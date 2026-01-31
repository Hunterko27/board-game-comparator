import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class AlbiScraper implements Scraper {
    name = 'Albi';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            const url = `https://eshop.albi.sk/vyhladavanie/?q=${encodeURIComponent(query)}`;
            console.log(`AlbiScraper: Navigating to ${url}`);

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Setup response interceptor
            const apiResponsePromise = page.waitForResponse(response =>
                response.url().includes('api.upsearch.cz/search') &&
                response.status() === 200 &&
                response.request().method() !== 'OPTIONS',
                { timeout: 20000 }
            );

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for the API response
            const response = await apiResponsePromise;
            const json = await response.json();

            if (json.data && json.data.items) {
                for (const item of json.data.items) {
                    // Map API fields to SearchResult interface
                    const name = item.name || item.name_highlight.replace(/<[^>]*>/g, '');

                    let priceVal = 0;
                    if (item.price_vat) {
                        priceVal = parseFloat(item.price_vat);
                    } else if (item.price) {
                        priceVal = parseFloat(item.price);
                    }

                    let link = item.url;
                    if (link && !link.startsWith('http')) {
                        link = `https://eshop.albi.sk${link}`;
                    }

                    const imageUrl = item.image_2x_link || item.image_link;
                    const availability = item.availability ? item.availability : 'Unknown';

                    if (name) {
                        results.push({
                            name,
                            price: priceVal,
                            currency: 'EUR',
                            availability,
                            link,
                            imageUrl,
                            shopName: 'Albi'
                        });
                    }
                }
            }

        } catch (error) {
            console.error('AlbiScraper: Error during search', error);
        } finally {
            await page.close();
        }

        return results;
    }
}

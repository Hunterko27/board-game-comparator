import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class VeselyDrakScraper implements Scraper {
    name = 'Vesely Drak';

    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('VeselyDrakScraper: Failed to launch browser', error);
            return [];
        }

        const results: SearchResult[] = [];
        let page;

        try {
            page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            // Direct navigation to search results on CZ site
            const url = `https://www.vesely-drak.cz/produkty/vyhledavani/?string=${encodeURIComponent(query)}`;
            console.log(`VeselyDrakScraper: Navigating to ${url}`);

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font', 'media', 'script'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // 60s timeout is too long, reduce to fail fast if stuck, but keep reasonable
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

            console.log('VeselyDrakScraper: Waiting for results');
            try {
                // Wait for the container that holds items
                await page.waitForSelector('.catalogue-item', { timeout: 10000 });
            } catch (e) {
                console.log('VeselyDrakScraper: No results found (or selector timeout)');
                return [];
            }

            const productData = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.catalogue-item');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('.product-name');
                        const linkEl = item.querySelector('a'); // The first anchor is usually the image link, but check structure
                        // Actually structure is: image-holder > a, text-holder > h3 > a. 
                        // Let's be more specific for link.
                        const nameLinkEl = item.querySelector('.product-name a');

                        const priceEl = item.querySelector('.price');
                        const imgEl = item.querySelector('img');
                        const availEl = item.querySelector('.usual-price');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (nameLinkEl as HTMLAnchorElement)?.href || (linkEl as HTMLAnchorElement)?.href || '';

                        const priceText = priceEl?.textContent?.trim() || '';
                        // Price format: "2 549 Kč"
                        const price = parseFloat(
                            priceText
                                .replace(/[^\d,.]/g, '') // Remove spaces and 'Kč'
                                .replace(',', '.')
                        );

                        const imageUrl = (imgEl as HTMLImageElement)?.src || (imgEl as HTMLImageElement)?.dataset.src || '';
                        const availability = availEl?.textContent?.trim() || 'Neznáma';

                        if (name && !isNaN(price)) {
                            // Relevance check: Ensure at least one significant word from the query is in the product name
                            // This filters out completely irrelevant results (e.g. "Vampire" for "Dirt")
                            const queryTokens = query.toLowerCase().split(/[^a-z0-9\u00C0-\u024F]+/).filter(t => t.length > 2);
                            const nameLower = name.toLowerCase();

                            const isRelevant = queryTokens.length === 0 || queryTokens.some(token => nameLower.includes(token));

                            if (isRelevant) {
                                data.push({
                                    name,
                                    price,
                                    currency: 'CZK',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Vesely Drak'
                                });
                            }
                        }
                    } catch (err) {
                        // ignore
                    }
                });

                return data;
            }, query);

            results.push(...productData);

        } catch (error) {
            console.error('VeselyDrakScraper: Error during search', error);
        } finally {
            if (page) await page.close();
            // We do NOT close the browser here if it's shared, unless getBrowser returns a new instance.
            // Assuming getBrowser returns a shared instance or a singleton, we should be careful.
            // But looking at existing code: `await browser.close()` was called. 
            // If getBrowser returns a NEW instance every time, we MUST close it.
            // If it returns a shared one, we MUST NOT.
            // The previous code had `await browser.close()`.
            // Let's verify `browser.ts`.
            if (browser) await browser.close();
        }

        return results;
    }
}

import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class PlanetaHerScraper implements Scraper {
    name = 'Planeta Her';

    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('PlanetaHerScraper: Failed to launch browser', error);
            return [];
        }

        let page;
        try {
            page = await browser.newPage();
            // ... rest of logic
            const results: SearchResult[] = [];

            try {
                const url = `https://www.planetaher.cz/vyhledavani?s=${encodeURIComponent(query)}`;
                console.log(`PlanetaHerScraper: Navigating to ${url}`);

                await page.setRequestInterception(true);
                page.on('request', (req: any) => {
                    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                        req.abort();
                    } else {
                        req.continue();
                    }
                });

                // Set User-Agent and extra headers
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                await page.setExtraHTTPHeaders({
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1'
                });

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

                // Check for empty results first
                const emptyResults = await page.$('.products--empty');
                if (emptyResults) {
                    return [];
                }

                // Wait for products
                try {
                    await page.waitForSelector('.lb-result', { timeout: 5000 });
                } catch (e) {
                    return [];
                }

                const products = await page.evaluate((query: string) => {
                    const items: any[] = [];
                    const productElements = document.querySelectorAll('.lb-result');

                    productElements.forEach((el) => {
                        const name = el.querySelector('.product-box__title')?.textContent?.trim();
                        const priceText = el.querySelector('.product-box__price')?.textContent?.trim();
                        const price = priceText ? parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) : NaN;
                        const link = el.querySelector('a')?.getAttribute('href');
                        const imageElement = el.querySelector('.product-box__image') as HTMLImageElement;
                        const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src');

                        let availability = 'Unknown';
                        const stockText = el.querySelector('.product-box__in-stock')?.textContent?.trim();
                        if (stockText) {
                            if (stockText.toLowerCase().includes('skladem')) {
                                availability = 'In Stock';
                            } else if (stockText.toLowerCase().includes('vyprodáno')) {
                                availability = 'Out of Stock';
                            } else if (stockText.toLowerCase().includes('předobjednávka')) {
                                availability = 'Pre-order';
                            }
                        }

                        if (name && !isNaN(price) && name.toLowerCase().includes(query.toLowerCase())) {
                            items.push({
                                name,
                                price,
                                currency: 'CZK', // Planeta Her is CZ
                                availability,
                                link,
                                imageUrl,
                                shopName: 'Planeta Her'
                            });
                        }
                    });

                    return items;
                }, query);

                results.push(...products);
            } catch (error) {
                console.error('PlanetaHerScraper: Error during search', error);
            }

            return results;
        } catch (e) {
            console.error('PlanetaHerScraper: Page error', e);
            return [];
        } finally {
            if (page) await page.close();
            // Do NOT close browser as it is a shared singleton
        }
    }
}

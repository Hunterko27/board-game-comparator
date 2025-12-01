import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class PlanetaHerScraper implements Scraper {
    name = 'Planeta Her';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            const url = `https://www.planetaher.cz/vyhledavani?s=${encodeURIComponent(query)}`;
            console.log(`PlanetaHerScraper: Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Check for empty results first
            const emptyResults = await page.$('.products--empty');
            if (emptyResults) {
                return [];
            }

            // Wait for products
            try {
                await page.waitForSelector('.lb-result', { timeout: 10000 });
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
        } finally {
            await browser.close();
        }

        return results;
    }
}

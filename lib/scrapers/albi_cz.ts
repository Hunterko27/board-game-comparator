import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class AlbiCZScraper implements Scraper {
    name = 'Albi CZ';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            // Try direct search URL first
            const url = `https://eshop.albi.cz/vyhledavani/?q=${encodeURIComponent(query)}`;
            console.log(`AlbiCZScraper: Navigating to ${url}`);
            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for products to load - try common selectors
            try {
                await page.waitForSelector('.up-product-box', { timeout: 5000 });
            } catch (e) {
                console.log('AlbiCZScraper: No products found');
                return [];
            }

            // Extract product data using page.evaluate
            const productData = await page.evaluate((query: string) => {
                const items: any[] = [];
                const productElements = document.querySelectorAll('.up-product-box');

                productElements.forEach((element) => {
                    try {
                        // Extract name
                        const nameEl = element.querySelector('.up-product-box__title a');
                        const name = nameEl?.textContent?.trim() || '';

                        // Extract link
                        const linkEl = element.querySelector('.up-product-box__title a');
                        const link = linkEl ? (linkEl as HTMLAnchorElement).href : '';

                        // Extract price
                        const priceEl = element.querySelector('.up-price__actual') || element.querySelector('.up-price');
                        const priceText = priceEl?.textContent?.trim() || '';
                        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                        // Extract image
                        const imgEl = element.querySelector('.up-image__img') || element.querySelector('img');
                        const imageUrl = imgEl ? (imgEl as HTMLImageElement).src : '';

                        // Extract availability
                        const availEl = element.querySelector('.up-stock');
                        const availability = availEl?.textContent?.trim() || 'Unknown';

                        if (name && !isNaN(price)) {
                            // Strict filtering: check if name contains query (case-insensitive)
                            if (name.toLowerCase().includes(query.toLowerCase())) {
                                items.push({
                                    name,
                                    price,
                                    currency: 'CZK',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Albi CZ'
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing product:', err);
                    }
                });

                return items;
            }, query);

            results.push(...productData);

        } catch (error) {
            console.error('AlbiCZScraper: Error during search', error);
        } finally {
            await page.close();
        }

        return results;
    }
}

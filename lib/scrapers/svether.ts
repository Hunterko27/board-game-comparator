import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class SvetHerScraper implements Scraper {
    name = 'Svět Her';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            const url = `https://www.svet-her.cz/Vyhledavani?fraze=${encodeURIComponent(query)}`;
            console.log(`SvetHerScraper: Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Check for empty results
            const emptyResults = await page.$('[data-role="empty"]');
            // Wait for products or empty indicator
            try {
                await page.waitForSelector('.product-list .product', { timeout: 10000 });
            } catch (e) {
                // If no products found, return empty array
                return [];
            }

            const products = await page.evaluate((query: string) => {
                const items: any[] = [];
                const productElements = document.querySelectorAll('.product-list .product');

                productElements.forEach((el) => {
                    const nameElement = el.querySelector('h3 a');
                    const name = nameElement?.textContent?.trim();
                    const link = nameElement?.getAttribute('href');

                    const priceElement = el.querySelector('.price');
                    const priceText = priceElement?.textContent?.trim();
                    const price = priceText ? parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) : NaN;

                    const imageElement = el.querySelector('.img img') as HTMLImageElement;
                    let imageUrl = imageElement?.src;

                    if (imageUrl && imageUrl.startsWith('data:')) {
                        const srcset = imageElement.getAttribute('srcset');
                        if (srcset) {
                            // Extract the first URL from srcset (usually 1x)
                            const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
                            if (firstSrc) {
                                imageUrl = firstSrc;
                            }
                        } else {
                            const dataSrc = imageElement.getAttribute('data-src');
                            if (dataSrc) {
                                imageUrl = dataSrc;
                            }
                        }
                    }

                    // Handle protocol-relative URLs
                    if (imageUrl && imageUrl.startsWith('//')) {
                        imageUrl = `https:${imageUrl}`;
                    }

                    let availability = 'Unknown';
                    const availabilityElement = el.querySelector('.js_dostupnost');
                    const availabilityText = availabilityElement?.textContent?.trim();

                    if (availabilityText) {
                        if (availabilityText.toLowerCase().includes('skladem')) {
                            availability = 'In Stock';
                        } else if (availabilityText.toLowerCase().includes('není skladem') || availabilityText.toLowerCase().includes('vyprodáno')) {
                            availability = 'Out of Stock';
                        } else if (availabilityText.toLowerCase().includes('předobjednávka') || availabilityText.toLowerCase().includes('očekáváme')) {
                            availability = 'Pre-order';
                        }
                    }

                    if (name && !isNaN(price)) {
                        items.push({
                            name,
                            price,
                            currency: 'CZK',
                            availability,
                            link: link ? (link.startsWith('http') ? link : `https://www.svet-her.cz${link}`) : undefined,
                            imageUrl,
                            shopName: 'Svět Her'
                        });
                    }
                });

                return items;
            }, query);

            results.push(...products);

        } catch (error) {
            console.error('SvetHerScraper: Error during search', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}

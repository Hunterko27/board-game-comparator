import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class SvetHerScraper implements Scraper {
    name = 'Svět Her';

    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('SvetHerScraper: Failed to launch browser', error);
            return [];
        }

        let page;
        try {
            page = await browser.newPage();
            const results: SearchResult[] = [];

            try {
                // Set User-Agent and extra headers to avoid detection
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

                const url = `https://www.svet-her.cz/Vyhledavani?fraze=${encodeURIComponent(query)}`;
                console.log(`SvetHerScraper: Navigating to ${url}`);

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

                // Check for empty results
                const emptyResults = await page.$('[data-role="empty"]');
                // Wait for products or empty indicator
                try {
                    await page.waitForSelector('.product-list .product', { timeout: 3000 });
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
            }

            return results;
        } catch (e) {
            console.error('SvetHerScraper: Page error', e);
            return [];
        } finally {
            if (page) await page.close();
            // Do NOT close browser as it is a shared singleton
        }
    }
}

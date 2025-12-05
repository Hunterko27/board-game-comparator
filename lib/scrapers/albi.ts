import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class AlbiScraper implements Scraper {
    name = 'Albi';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            // Try direct search URL first
            const url = `https://eshop.albi.sk/vyhladavanie/?q=${encodeURIComponent(query)}`;
            console.log(`AlbiScraper: Navigating to ${url}`);
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

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for products to load - try common selectors
            // Based on typical e-commerce structures, let's try waiting for product cards
            try {
                await page.waitForSelector('.up-product-box', { timeout: 3000 });
            } catch (e) {
                console.log('AlbiScraper: No products found');
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
                                    currency: 'EUR',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Albi'
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
            console.error('AlbiScraper: Error during search', error);
        } finally {
            await page.close();
        }

        return results;
    }
}

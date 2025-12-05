import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

/**
 * Scraper for Funtastic.sk.
 * Implements a two‑stage approach:
 *   1. Search page – collect product name and link.
 *   2. Individual product pages – extract price (with fallback to meta tags) and image URL.
 */
export class FuntasticScraper implements Scraper {
    name = 'Funtastic';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            const url = `https://www.funtastic.sk/search-engine.htm?slovo=${encodeURIComponent(query)}&search_submit=&hledatjak=2`;
            console.log(`FuntasticScraper: Navigating to ${url}`);

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

            // Extract data directly from search page
            const items = await page.evaluate((query: string) => {
                const data: any[] = [];
                const productContainers = document.querySelectorAll('.productBody');

                productContainers.forEach((container) => {
                    try {
                        const nameEl = container.querySelector('.productTitle a');
                        const imgEl = container.querySelector('.img_box img');
                        const priceEl = container.querySelector('.product_price_text');

                        if (nameEl && priceEl) {
                            const name = nameEl.textContent?.trim() || '';
                            const link = (nameEl as HTMLAnchorElement).href;

                            // Image might be lazy loaded or in a different attribute
                            let imageUrl = '';
                            if (imgEl) {
                                imageUrl = (imgEl as HTMLImageElement).src ||
                                    imgEl.getAttribute('data-src') ||
                                    '';
                            }

                            const priceText = priceEl.textContent?.trim() || '';
                            // Parse price "26,95 €"
                            const priceMatch = priceText.match(/([\d\s,]+)/);
                            let price = 0;
                            if (priceMatch) {
                                price = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'));
                            }

                            if (name && !isNaN(price)) {
                                if (name.toLowerCase().includes(query.toLowerCase())) {
                                    data.push({
                                        name,
                                        price,
                                        currency: 'EUR',
                                        availability: 'Neznáma',
                                        link,
                                        imageUrl,
                                        shopName: 'Funtastic'
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        // Ignore individual errors
                    }
                });
                return data;
            }, query);

            results.push(...items);

        } catch (err) {
            console.error('FuntasticScraper: error during search', err);
        } finally {
            await browser.close();
        }

        return results;
    }
}

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
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
            // Give the page a moment to render dynamic content.
            await new Promise(r => setTimeout(r, 3000));

            // Stage 1 – collect basic product data from the search results.
            const basicData: { name: string; link: string }[] = await page.evaluate((query: string) => {
                const containers = document.querySelectorAll('.productTitleContent');
                const list: { name: string; link: string }[] = [];
                containers.forEach(c => {
                    const a = c.querySelector('a');
                    if (a) {
                        const name = a.textContent?.trim() || '';
                        const link = (a as HTMLAnchorElement).href;
                        if (name && link) {
                            // Strict filtering: check if name contains query (case-insensitive)
                            if (name.toLowerCase().includes(query.toLowerCase())) {
                                list.push({ name, link });
                            }
                        }
                    }
                });
                return list;
            }, query);

            // Limit the number of product pages we visit to keep execution time reasonable.
            const limited = basicData.slice(0, 10);

            // Stage 2 – visit each product page and extract price & image.
            for (const item of limited) {
                try {
                    const prodPage = await browser.newPage();
                    await prodPage.goto(item.link, { waitUntil: 'networkidle2', timeout: 25000 });
                    // Wait a short while for price elements to appear.
                    await new Promise(r => setTimeout(r, 2000));

                    const details = await prodPage.evaluate(() => {
                        let price = 0;

                        // Strategy 1: Hidden input with exact price (most reliable)
                        const hiddenInput = document.querySelector('input[name="nase_cena"]') as HTMLInputElement;
                        if (hiddenInput && hiddenInput.value) {
                            price = parseFloat(hiddenInput.value);
                        }

                        // Strategy 2: Price element with content attribute
                        if (!price) {
                            const priceValueEl = document.querySelector('.price-value');
                            if (priceValueEl && priceValueEl.getAttribute('content')) {
                                const content = priceValueEl.getAttribute('content');
                                if (content) {
                                    price = parseFloat(content.replace(',', '.'));
                                }
                            }
                        }

                        // Strategy 3: Price element text content
                        if (!price) {
                            const priceEl = document.querySelector('.price-value');
                            if (priceEl) {
                                const txt = priceEl.textContent?.trim() || '';
                                const match = txt.match(/[\d\s,]+/);
                                if (match) price = parseFloat(match[0].replace(/\s/g, '').replace(',', '.'));
                            }
                        }

                        // Strategy 4: Fallback to meta tags
                        if (!price) {
                            const meta = document.querySelector('meta[property="og:price:amount"], meta[name="price"]') as HTMLMetaElement | null;
                            if (meta && meta.content) {
                                const match = meta.content.match(/[\d\s,]+/);
                                if (match) price = parseFloat(match[0].replace(/\s/g, '').replace(',', '.'));
                            }
                        }

                        const imgEl = document.querySelector('img[id^="detail_src_magnifying"]'); // More specific image selector
                        const imageUrl = imgEl ? (imgEl as HTMLImageElement).src : (document.querySelector('img')?.src || '');

                        return { price, imageUrl };
                    });

                    results.push({
                        name: item.name,
                        price: details.price,
                        currency: 'EUR',
                        availability: 'Neznáma',
                        link: item.link,
                        imageUrl: details.imageUrl.startsWith('http') ? details.imageUrl : `https://www.funtastic.sk${details.imageUrl}`,
                        shopName: 'Funtastic',
                    });
                    await prodPage.close();
                } catch (innerErr) {
                    console.error('Error fetching product details for', item.link, innerErr);
                }
            }
        } catch (err) {
            console.error('FuntasticScraper: error during search', err);
        } finally {
            await browser.close();
        }

        return results;
    }
}

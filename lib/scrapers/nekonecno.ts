import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class NekonecnoScraper implements Scraper {
    name = 'Nekonecno';
    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('NekonecnoScraper: Failed to launch browser', error);
            return [];
        }

        let page;
        try {
            page = await browser.newPage();
            const searchUrl = `https://www.nekonecno.sk/vyhladavanie/?string=${encodeURIComponent(query)}`;

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

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

            // Wait for products to load
            try {
                await page.waitForSelector('.product.lb-product', { timeout: 5000 });
            } catch (e) {
                // Ignore timeout, might be 0 results
            }

            const results = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.product.lb-product');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('.name');
                        const linkEl = item.querySelector('a.image');
                        const priceEl = item.querySelector('.price-final strong');
                        const imgEl = item.querySelector('.swap-image');
                        const availEl = item.querySelector('.availability span');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (linkEl as HTMLAnchorElement)?.href || '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Remove '€' and replace ',' with '.' and remove spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                        const price = parseFloat(priceText);

                        const imageUrl = (imgEl as HTMLImageElement)?.src || '';

                        const availability = availEl?.textContent?.trim() || 'Neznáma';

                        if (name && !isNaN(price)) {
                            // Strict filtering: check if name contains query (case-insensitive)
                            if (name.toLowerCase().includes(query.toLowerCase())) {
                                data.push({
                                    name,
                                    price,
                                    currency: 'EUR',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Nekonecno'
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing product:', err);
                    }
                });

                return data;
            }, query);

            return results;
        } catch (error) {
            console.error('Nekonecno scraper error:', error);
            return [];
        } finally {
            if (page) await page.close();
            // Do NOT close browser as it is a shared singleton
        }
    }
}

import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class DracikScraper implements Scraper {
    name = 'Dracik';
    async search(query: string): Promise<SearchResult[]> {
        let browser;
        try {
            browser = await getBrowser();
        } catch (error) {
            console.error('DracikScraper: Failed to launch browser', error);
            return [];
        }

        let page;
        try {
            page = await browser.newPage();

            const searchUrl = `https://www.dracik.sk/search/?search=${encodeURIComponent(query)}`;

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

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for products
            try {
                await page.waitForSelector('.ProductCard', { timeout: 5000 });
            } catch (e) {
                // Ignore timeout
            }

            const results = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.ProductCard');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('.ProductCard-title');
                        const linkEl = item.querySelector('.ProductCard-link');
                        const priceEl = item.querySelector('.ProductCard-price');
                        const imgEl = item.querySelector('.ProductCard-image');
                        const availEl = item.querySelector('.Stock');

                        const name = nameEl?.textContent?.trim() || '';
                        const linkRelative = (linkEl as HTMLAnchorElement)?.getAttribute('href') || '';
                        const link = linkRelative ? `https://www.dracik.sk${linkRelative}` : '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Price format is usually "€ 27,99"
                        // Remove '€' and replace ',' with '.' and remove spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                        const price = parseFloat(priceText);

                        const imgRelative = (imgEl as HTMLImageElement)?.getAttribute('src') || '';
                        const imageUrl = imgRelative ? `https://www.dracik.sk${imgRelative}` : '';

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
                                    shopName: 'Dráčik'
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
            console.error('Dracik scraper error:', error);
            return [];
        } finally {
            if (page) await page.close();
            // Do NOT close browser as it is a shared singleton
        }
    }
}

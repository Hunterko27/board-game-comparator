import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class NekonecnoScraper implements Scraper {
    name = 'Nekonecno';
    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.nekonecno.sk/vyhladavanie/?string=${encodeURIComponent(query)}`;

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(searchUrl, { waitUntil: 'networkidle2' });

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
            await browser.close();
        }
    }
}

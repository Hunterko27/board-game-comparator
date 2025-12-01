import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class GorilaScraper implements Scraper {
    name = 'Gorila';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.gorila.sk/vyhladavanie?q=${encodeURIComponent(query)}&types%5B0%5D=hra`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });

            const results = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.item');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('h2 a');
                        const linkEl = item.querySelector('h2 a');
                        const priceEl = item.querySelector('.vb-price .after');
                        const imgEl = item.querySelector('.cover img');
                        const availEl = item.querySelector('.vb-cart-box-left span');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (linkEl as HTMLAnchorElement)?.href || '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Remove '€' and replace ',' with '.' and remove spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                        const price = parseFloat(priceText);

                        const imageUrl = (imgEl as HTMLImageElement)?.src || '';
                        const availability = availEl?.textContent?.trim() || 'Neznáme';

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
                                    shopName: 'Gorila'
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
            console.error('Gorila scraper error:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}

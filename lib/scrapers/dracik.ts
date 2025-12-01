import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class DracikScraper implements Scraper {
    name = 'Dracik';
    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.dracik.sk/search/?search=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });

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
            await browser.close();
        }
    }
}

import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class XzoneScraper implements Scraper {
    name = 'Xzone';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.xzone.sk/katalog.php?term=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });

            const results = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.product-item');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('.product-item-name a');
                        const priceEl = item.querySelector('.price-box .price');
                        const imgEl = item.querySelector('.product-image img');
                        const availEl = item.querySelector('.expedice-date a');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (nameEl as HTMLAnchorElement)?.href || '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Remove '€' and replace ',' with '.' and remove spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                        const price = parseFloat(priceText);

                        const imageUrl = (imgEl as HTMLImageElement)?.src || '';
                        const availability = availEl?.textContent?.trim() || 'Neznáme';

                        if (name && !isNaN(price)) {
                            // Strict filtering: check if name contains query
                            // For short queries (like "azul"), ensure whole word match to avoid "Azula"
                            const queryLower = query.toLowerCase();
                            const titleLower = name.toLowerCase();

                            let isRelevant = false;
                            if (queryLower.length <= 4) {
                                // Whole word match for short queries
                                const regex = new RegExp(`\\b${queryLower}\\b`, 'i');
                                isRelevant = regex.test(titleLower);
                            } else {
                                // Standard inclusion for longer queries
                                isRelevant = titleLower.includes(queryLower);
                            }

                            if (isRelevant) {
                                data.push({
                                    name,
                                    price,
                                    currency: 'EUR',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Xzone'
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
            console.error('Xzone scraper error:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}

import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class HrackyshopScraper implements Scraper {
    name = 'Hrackyshop';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            // Use search_keywords parameter
            const url = `https://www.hrackyshop.sk/hladaj?search_keywords=${encodeURIComponent(query)}`;
            console.log(`HrackyshopScraper: Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const productData = await page.evaluate((query: string) => {
                // Use .product_box_cont as container
                const items = document.querySelectorAll('.product_box_cont');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('h2.product_name');
                        const linkEl = item.querySelector('a.product_box');
                        const priceEl = item.querySelector('.product_discounted_price') || item.querySelector('.product_base_price');
                        const imgEl = item.querySelector('.product_image img');
                        const availEl = item.querySelector('.stock_state_icon');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (linkEl as HTMLAnchorElement)?.href || '';

                        const priceText = priceEl?.textContent?.trim() || '';
                        // Extract price: remove non-numeric except comma/dot, replace comma with dot
                        const price = parseFloat(priceText.replace(/[^\d,.]/g, '').replace(',', '.'));

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
                                    link: link.startsWith('http') ? link : `https://www.hrackyshop.sk${link}`,
                                    imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.hrackyshop.sk${imageUrl}`,
                                    shopName: 'Hrackyshop'
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing product:', err);
                    }
                });

                return data;
            }, query);

            results.push(...productData);

        } catch (error) {
            console.error('HrackyshopScraper: Error during search', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}

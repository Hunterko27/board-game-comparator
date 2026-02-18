import { Scraper, SearchResult } from './types';


export class HrackyshopScraper implements Scraper {
    name = 'Hrackyshop';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            // Use search_keywords parameter
            const url = `https://www.hrackyshop.sk/hladaj?search_keywords=${encodeURIComponent(query)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`HrackyshopScraper: Failed to fetch ${url}, status: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const { load } = require('cheerio'); // Dynamic import if possible, or just require since checked package.json
            const $ = load(html);

            $('.product_box_cont').each((_: any, element: any) => {
                try {
                    const el = $(element);
                    const name = el.find('h2.product_name').text().trim();
                    const linkRel = el.find('a.product_box').attr('href') || '';
                    const link = linkRel.startsWith('http') ? linkRel : `https://www.hrackyshop.sk${linkRel}`;

                    const priceBase = el.find('.product_discounted_price').text().trim() || el.find('.product_base_price').text().trim();
                    const price = parseFloat(priceBase.replace(/[^\d,.]/g, '').replace(',', '.'));

                    const imgRel = el.find('.product_image img').attr('src') || '';
                    const imageUrl = imgRel.startsWith('http') ? imgRel : `https://www.hrackyshop.sk${imgRel}`;

                    const availability = el.find('.stock_state_icon').text().trim() || 'Neznáma';

                    if (name && !isNaN(price)) {
                        if (name.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                name,
                                price,
                                currency: 'EUR',
                                availability,
                                link,
                                imageUrl,
                                shopName: 'Hrackyshop'
                            });
                        }
                    }
                } catch (err) {
                    console.error('HrackyshopScraper: Error parsing item', err);
                }
            });

        } catch (error) {
            console.error('HrackyshopScraper: Error', error);
        }

        return results;
    }
}

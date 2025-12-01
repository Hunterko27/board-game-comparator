import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class HryDoRukyScraper implements Scraper {
    name = 'Hry Do Ruky';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.hrydoruky.cz/search?q=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.product-item').each((_, element) => {
                const $element = $(element);
                const name = $element.find('.product-title a').text().trim();
                const link = $element.find('.product-title a').attr('href');
                const priceText = $element.find('.actual-price').text().trim();
                const image = $element.find('.picture img').attr('data-lazyloadsrc') || $element.find('.picture img').attr('src');

                // Availability is not explicitly shown in the grid, but "Koupit" button implies in stock.
                // We can assume available if price is present.
                const availability = 'Skladem';

                if (name && link && priceText) {
                    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: link.startsWith('http') ? link : `https://www.hrydoruky.cz${link}`,
                        shopName: 'Hry Do Ruky',
                        imageUrl: image?.startsWith('http') ? image : (image ? `https://www.hrydoruky.cz${image}` : undefined),
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('Hry Do Ruky scraper error:', error);
            return [];
        }
    }
}

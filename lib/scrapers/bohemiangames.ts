import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class BohemianGamesScraper implements Scraper {
    name = 'Bohemian Games';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.bohemiangames.cz/vyhledavani/?string=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.product').each((_, element) => {
                const $element = $(element);
                const name = $element.find('.name').text().trim();
                const link = $element.find('.name').attr('href');
                const priceText = $element.find('.price-final').text().trim();
                const availability = $element.find('.availability').text().trim();
                const image = $element.find('.image img').attr('src');

                if (name && link && priceText) {
                    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: link.startsWith('http') ? link : `https://www.bohemiangames.cz${link}`,
                        shopName: 'Bohemian Games',
                        imageUrl: image?.startsWith('http') ? image : (image ? `https://www.bohemiangames.cz${image}` : undefined),
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('Bohemian Games scraper error:', error);
            return [];
        }
    }
}

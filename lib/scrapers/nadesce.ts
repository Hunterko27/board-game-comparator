import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class NadesceScraper implements Scraper {
    name = 'Na Desce';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.nadesce.cz/vyhledavani/?string=${encodeURIComponent(query)}`;
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
                let image = $element.find('.image img').attr('data-src');
                if (!image) {
                    image = $element.find('.image img').attr('src');
                }
                image = image?.trim();

                if (name && link && priceText) {
                    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: link.startsWith('http') ? link : `https://www.nadesce.cz${link}`,
                        shopName: 'Na Desce',
                        imageUrl: image?.startsWith('http') ? image : (image ? `https://www.nadesce.cz${image}` : undefined),
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('Na Desce scraper error:', error);
            return [];
        }
    }
}

import * as cheerio from 'cheerio';
import { Scraper, SearchResult } from './types';

export class SvetHierScraper implements Scraper {
    name = 'Svet-Hier';
    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.svet-hier.sk/Vyhledavani?fraze=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.product-box').each((_, element) => {
                const $element = $(element);

                const titleElement = $element.find('h3 a');
                const title = titleElement.text().trim();
                const link = titleElement.attr('href') || '';
                const fullLink = link.startsWith('http') ? link : `https://www.svet-hier.sk${link}`;

                const priceElement = $element.find('.price');
                const priceText = priceElement.text().trim();
                const price = parseFloat(priceText.replace(',', '.').replace(/[^0-9.]/g, ''));

                const imageElement = $element.find('.img img');
                let imageUrl = imageElement.attr('src') || '';
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                const availabilityElement = $element.find('.js_dostupnost');
                let availability = availabilityElement.text().trim();
                if (!availability) {
                    availability = $element.find('form[action*="Koupit"]').length > 0 ? 'Skladom' : 'Neznáma';
                }

                if (title && !isNaN(price)) {
                    results.push({
                        name: title,
                        price: price,
                        currency: 'EUR',
                        availability: availability,
                        link: fullLink,
                        shopName: 'Svet-Hier',
                        imageUrl: imageUrl
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping svet-hier.sk:', error);
        }

        return results;
    }
}

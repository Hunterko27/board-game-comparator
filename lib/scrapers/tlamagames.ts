import * as cheerio from 'cheerio';
import { Scraper, SearchResult } from './types';

export class TlamaGamesScraper implements Scraper {
    name = 'TlamaGames';
    async search(query: string): Promise<SearchResult[]> {
        // Removed &currency=EUR to get CZK prices by default (or we could add &currency=CZK)
        const url = `https://www.tlamagames.com/vyhledavani/?string=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.product').each((_, element) => {
                const $element = $(element);

                const titleElement = $element.find('.name');
                const title = titleElement.text().trim();
                const link = $element.find('a').attr('href') || '';
                const fullLink = link.startsWith('http') ? link : `https://www.tlamagames.com${link}`;

                const priceElement = $element.find('.price');
                const priceText = priceElement.text().trim();
                // Price format: "1 234 Kč" or similar -> 1234
                const price = parseFloat(priceText.replace('Kč', '').replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, ''));

                const availabilityElement = $element.find('.availability');
                const availabilityText = availabilityElement.text().trim();
                const availability = availabilityText.replace(/\s+/g, ' ').trim();

                const imageElement = $element.find('img');
                let imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || '';
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                // Check if all query words are present in the title (case-insensitive)
                const queryWords = query.toLowerCase().split(/\s+/);
                const titleLower = title.toLowerCase();
                const isRelevant = queryWords.every(word => titleLower.includes(word));

                if (title && !isNaN(price) && isRelevant) {
                    results.push({
                        name: title,
                        price: price,
                        currency: 'CZK',
                        availability: availability,
                        link: fullLink,
                        shopName: 'TlamaGames',
                        imageUrl: imageUrl
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping tlamagames.com:', error);
        }

        return results;
    }
}

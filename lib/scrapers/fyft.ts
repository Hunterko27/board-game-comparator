import * as cheerio from 'cheerio';
import { Scraper, SearchResult } from './types';

export class FyftScraper implements Scraper {
    name = 'Fyft';
    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.fyft.sk/vyhladavanie/?string=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.p').each((_, element) => {
                const $element = $(element);

                const titleElement = $element.find('.name');
                const title = titleElement.text().trim();
                const link = $element.find('a').attr('href') || '';
                const fullLink = link.startsWith('http') ? link : `https://www.fyft.sk${link}`;

                const priceElement = $element.find('.price-final');
                const priceText = priceElement.text().trim();
                const price = parseFloat(priceText.replace(',', '.').replace(/[^0-9.]/g, ''));

                const availabilityElement = $element.find('.availability');
                const availabilityText = availabilityElement.text().trim();
                // Clean up availability text (remove newlines and extra spaces)
                const availability = availabilityText.replace(/\s+/g, ' ').trim();

                const imageElement = $element.find('img');
                let imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || '';
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                // Relevance check:
                // 1. Ensure ALL significant words from the query are in the product name
                const queryTokens = query.toLowerCase().split(/[^a-z0-9\u00C0-\u024F]+/).filter(t => t.length > 2);
                const nameLower = title.toLowerCase();
                const hasAllTokens = queryTokens.length === 0 || queryTokens.every(token => nameLower.includes(token));

                // 2. Filter out common non-board-game items
                const negativeKeywords = ['vallejo', 'ak interactive', 'citadel', 'army painter', 'pigment', 'štětce', 'barvy', 'colors', 'warpaints', 'weathering'];
                const hasNegativeKeyword = negativeKeywords.some(kw => nameLower.includes(kw));

                const isRelevant = hasAllTokens && !hasNegativeKeyword;

                if (title && !isNaN(price) && isRelevant) {
                    results.push({
                        name: title,
                        price: price,
                        currency: 'EUR',
                        availability: availability,
                        link: fullLink,
                        shopName: 'Fyft',
                        imageUrl: imageUrl
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping fyft.sk:', error);
        }

        return results;
    }
}

import * as cheerio from 'cheerio';
import { Scraper, SearchResult } from './types';

export class IhryskoScraper implements Scraper {
    name = 'iHrysko';
    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.ihrysko.sk/vyhladavanie?search=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.products__item').each((_, element) => {
                const $element = $(element);

                const titleElement = $element.find('.product-thumb__name a');
                const title = titleElement.text().trim();
                const link = titleElement.attr('href') || '';

                const priceElement = $element.find('.actual-price r-span');
                const priceText = priceElement.text().trim();
                const price = parseFloat(priceText.replace(',', '.').replace('€', '').trim());

                const availabilityElement = $element.find('.product-thumb__availability .text');
                const availability = availabilityElement.text().trim();

                const imageElement = $element.find('.product-thumb__img img');
                let imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || '';
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                if (title && !isNaN(price)) {
                    // Strict filtering: check if name contains query (case-insensitive)
                    if (title.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            name: title,
                            price: price,
                            currency: 'EUR',
                            availability: availability,
                            link: link,
                            shopName: 'iHrysko',
                            imageUrl: imageUrl
                        });
                    }
                }
            });

        } catch (error) {
            console.error('Error scraping ihrysko.sk:', error);
        }

        return results;
    }
}

import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class OdhryScraper implements Scraper {
    name = 'Odhry';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.odhry.cz/vyhledavani/?string=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('div.product').each((_, element) => {
                const $element = $(element);
                const name = $element.find('span[data-micro="name"]').text().trim();

                let priceText = $element.find('.price-final').text().trim();
                if (!priceText) {
                    priceText = $element.find('strong.price-final').text().trim();
                }
                const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                const addToCartButton = $element.find('button.add-to-cart-button');
                const availabilityText = $element.find('.availability').text().trim();
                let availability = 'Není skladem';
                if (addToCartButton.length > 0 || availabilityText.includes('Skladem')) {
                    availability = 'Skladem';
                }

                let imageUrl = $element.find('img.swap-image').attr('data-src');
                if (!imageUrl) {
                    imageUrl = $element.find('img.swap-image').attr('src');
                }

                const link = $element.find('a[data-micro="url"]').attr('href');

                if (name && !isNaN(price) && link) {
                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: link.startsWith('http') ? link : `https://www.odhry.cz${link}`,
                        shopName: 'Odhry',
                        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.odhry.cz${imageUrl}`) : undefined
                    });
                }
            });
        } catch (error) {
            console.error('Error scraping Odhry:', error);
        }

        return results;
    }
}

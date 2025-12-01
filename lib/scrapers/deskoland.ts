import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class DeskolandScraper implements Scraper {
    name = 'Deskoland';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.deskoland.cz/search-engine.htm?slovo=${encodeURIComponent(query)}&search_submit=&hledatjak=2`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            $('div.product').each((_, element) => {
                const $element = $(element);
                const nameElement = $element.find('div.productTitle a');
                const name = nameElement.text().trim();
                const link = nameElement.attr('href');

                const priceText = $element.find('div.productPrice span.product_price_text').text().trim();
                const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                const stockYes = $element.find('div.stock_yes').length > 0;
                const availability = stockYes ? 'Skladem' : 'Není skladem';

                let imageUrl = $element.find('div.img_box img').attr('src');
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://www.deskoland.cz${imageUrl}`;
                }

                if (name && !isNaN(price) && link) {
                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: link.startsWith('http') ? link : `https://www.deskoland.cz${link}`,
                        shopName: 'Deskoland',
                        imageUrl
                    });
                }
            });
        } catch (error) {
            console.error('Error scraping Deskoland:', error);
        }

        return results;
    }
}

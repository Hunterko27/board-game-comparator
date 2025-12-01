import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class LudopolisScraper implements Scraper {
    name = 'Ludopolis';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.ludopolis.sk/sk/vyhladavanie/?keyword=${encodeURIComponent(query)}&search=true`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = await response.text();
            const $ = cheerio.load(html);
            $('.prod_holder').each((_, element) => {
                const $element = $(element);

                const nameElement = $element.find('.product_title');
                const name = nameElement.text().trim();
                const link = nameElement.attr('href') || '';

                const priceElement = $element.find('.normalprice');
                let priceText = priceElement.text().trim();
                // Price format: "Cena s DPH: 21,90 €" -> 21.90
                const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                const stockElement = $element.find('.stock_status_list');
                let availability = stockElement.text().replace('Dostupnosť:', '').trim();
                if (!availability) availability = 'Neznáma';

                const imageElement = $element.find('.prod_image_height_cutter_xc img');
                const imageUrl = imageElement.attr('src') || '';

                if (name && !isNaN(price)) {
                    // Strict filtering: check if name contains query (case-insensitive)
                    if (name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            name: name,
                            price: price,
                            currency: 'EUR',
                            availability: availability,
                            link: link,
                            shopName: 'Ludopolis',
                            imageUrl: imageUrl
                        });
                    }
                }
            });

        } catch (error) {
            console.error('Error scraping Ludopolis:', error);
        }

        return results;
    }
}

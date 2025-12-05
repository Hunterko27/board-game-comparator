import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class SvetDeskovychHerScraper implements Scraper {
    name = 'Svět deskových her';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.svet-deskovych-her.cz/hledani/vysledek?Produkt=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Connection': 'keep-alive'
                }
            });
            const html = await response.text();
            const $ = cheerio.load(html);

            $('#productsList .list-products li').each((_, element) => {
                const $element = $(element);

                const nameElement = $element.find('h3.item-name');
                const name = nameElement.text().trim();

                const linkElement = $element.find('a');
                const link = linkElement.attr('href');
                const fullLink = link ? (link.startsWith('http') ? link : `https://www.svet-deskovych-her.cz/${link.replace(/^\//, '')}`) : undefined;

                const imageElement = $element.find('.item-img img');
                let imageUrl = imageElement.attr('src');
                if (imageUrl && imageUrl.startsWith('//')) {
                    imageUrl = `https:${imageUrl}`;
                }

                const priceElement = $element.find('.text-price');
                const priceText = priceElement.text().replace(/\s+/g, '').replace('Kč', '').replace(',', '.');
                const price = parseFloat(priceText);

                let availability = 'Unknown';
                const availabilityElement = $element.find('.item-text p').first();
                const availabilityText = availabilityElement.text().trim().toLowerCase();

                if (availabilityText.includes('skladem')) {
                    availability = 'In Stock';
                } else if (availabilityText.includes('není skladem') || availabilityText.includes('vyprodáno') || availabilityText.includes('nemá vydavatel')) {
                    availability = 'Out of Stock';
                } else if (availabilityText.includes('předobjednávka') || availabilityText.includes('očekáváme')) {
                    availability = 'Pre-order';
                }

                if (name && !isNaN(price) && fullLink) {
                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: fullLink,
                        imageUrl,
                        shopName: 'Svět deskových her'
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping Svet deskových her:', error);
        }

        return results;
    }
}

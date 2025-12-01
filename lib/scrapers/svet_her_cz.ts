import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class SvetHerScraper implements Scraper {
    name = 'SvetHer';

    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.svet-her.cz/Vyhledavani?fraze=${encodeURIComponent(query)}`;
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

                const linkElement = $element.find('a[href^="/spolecenske-hry/"]');
                const name = linkElement.text().trim();
                const link = linkElement.attr('href') || '';
                const fullLink = link.startsWith('http') ? link : `https://www.svet-her.cz${link}`;

                // Price and availability are tricky text nodes
                // Structure seems to be: ... <br> Availability Text <br> Price Text ...
                // Or sometimes spans. Let's try to extract text and parse.
                const fullText = $element.text().replace(/\s+/g, ' ').trim();

                // Extract price: look for number followed by "Kč" at the end
                const priceMatch = fullText.match(/(\d[\d\s]*),-? Kč/);
                let price = NaN;
                if (priceMatch) {
                    price = parseFloat(priceMatch[1].replace(/\s/g, ''));
                }

                // Availability: usually contains "Skladem" or "Není skladem"
                let availability = 'Neznáma';
                if (fullText.includes('Skladem')) {
                    const stockMatch = fullText.match(/Skladem.*?(?=\d)/); // simplistic
                    availability = stockMatch ? stockMatch[0].trim() : 'Skladem';
                } else if (fullText.includes('Není skladem')) {
                    availability = 'Není skladem';
                }

                const imageElement = $element.find('a.img img');
                let imageUrl = imageElement.attr('src') || '';
                if (imageUrl.startsWith('/')) {
                    imageUrl = `https://www.svet-her.cz${imageUrl}`;
                }

                if (name && !isNaN(price)) {
                    results.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: fullLink,
                        shopName: 'SvetHer',
                        imageUrl
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping SvetHer:', error);
        }

        return results;
    }
}

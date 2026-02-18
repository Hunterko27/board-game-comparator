import { Scraper, SearchResult } from './types';
import { load } from 'cheerio';

export class DracikScraper implements Scraper {
    name = 'Dracik';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            const searchUrl = `https://www.dracik.sk/search/?search=${encodeURIComponent(query)}`;

            // Add error handling for fetch in case network fails
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`Dracik scraper failed to fetch: ${response.status} ${response.statusText}`);
                return [];
            }

            const html = await response.text();

            // Use load() directly from named import
            const $ = load(html);

            $('.ProductCard').each((_, element) => {
                try {
                    const item = $(element);
                    const name = item.find('.ProductCard-title').text().trim();
                    const linkRelative = item.find('.ProductCard-link').attr('href');
                    const link = linkRelative ? `https://www.dracik.sk${linkRelative}` : '';

                    let priceText = item.find('.ProductCard-price').text().trim();
                    // Price format is usually "€ 27,99"
                    priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                    const price = parseFloat(priceText);

                    const imgRelative = item.find('.ProductCard-image').attr('src');
                    const imageUrl = imgRelative ? `https://www.dracik.sk${imgRelative}` : '';

                    const availability = item.find('.Stock').text().trim() || 'Neznáma';

                    if (name && !isNaN(price)) {
                        if (name.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                name,
                                price,
                                currency: 'EUR',
                                availability,
                                link,
                                imageUrl,
                                shopName: 'Dráčik'
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error parsing Dracik product:', err);
                }
            });

        } catch (error) {
            console.error('Dracik scraper error:', error);
            // We do NOT re-throw, to avoid crashing the API route.
        }
        return results;
    }
}

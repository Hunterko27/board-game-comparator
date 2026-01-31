import { Scraper, SearchResult } from './types';
import { load } from 'cheerio';

export class ImagoScraper implements Scraper {
    name = 'Imago';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            const searchUrl = `https://www.imago.sk/index.php?route=product/search&keyword=${encodeURIComponent(query)}`;
            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`ImagoScraper: Failed to fetch ${searchUrl}, status: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = load(html);

            $('#productsArea .product-list-item').each((_, element) => {
                try {
                    const el = $(element);
                    const name = el.find('.vypis_h3 a').text().trim();
                    const link = el.find('.vypis_h3 a').attr('href') || '';

                    let priceText = el.find('.vypis_cena').text().trim();
                    // Remove '€' and replace ',' with '.' and remove spaces
                    priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                    const price = parseFloat(priceText);

                    const imgEl = el.find('.img-productsarea');
                    const imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';

                    let availability = 'Nedostupné';
                    if (el.find('.skladem').length > 0) {
                        availability = el.find('.skladem').text().trim() || 'Skladom';
                    } else if (el.find('.na_ceste').length > 0) {
                        availability = el.find('.na_ceste').text().trim() || 'Na ceste';
                    }

                    if (name && !isNaN(price)) {
                        // Strict filtering
                        if (name.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                name,
                                price,
                                currency: 'EUR',
                                availability,
                                link,
                                imageUrl,
                                shopName: 'Imago'
                            });
                        }
                    }
                } catch (err) {
                    console.error('ImagoScraper: Error parsing item', err);
                }
            });

        } catch (error) {
            console.error('ImagoScraper: Error', error);
        }

        return results;
    }
}

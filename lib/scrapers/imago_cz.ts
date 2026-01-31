import { Scraper, SearchResult } from './types';
import { load } from 'cheerio';

export class ImagoCZScraper implements Scraper {
    name = 'Imago CZ';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            const url = `https://www.imago.cz/hledani/${encodeURIComponent(query)}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`ImagoCZScraper: Failed to fetch ${url}, status: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = load(html);

            $('.item.product').each((_, element) => {
                try {
                    const el = $(element);
                    const button = el.find('button.addToCart');
                    const linkEl = el.find('a.absolute-link');

                    if (button.length === 0 || linkEl.length === 0) return;

                    const name = button.attr('product_name') || '';
                    const priceStr = button.attr('product_price') || '';
                    const price = parseFloat(priceStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
                    const image = 'https://img.imago.cz/' + (button.attr('product_image') || '');
                    const stockStatus = button.attr('product_stock_status');
                    const stockQuantity = parseInt(button.attr('product_stock_quantity') || '0', 10);
                    const link = linkEl.attr('href') || '';

                    let availability = 'Neznámá';
                    if (stockStatus === 'dostupne') {
                        if (stockQuantity <= 0) {
                            availability = 'Na objednávku';
                        } else {
                            availability = 'Skladem';
                        }
                    } else if (stockStatus === 'nedostupne') {
                        availability = 'Nedostupné';
                    }

                    // Strict filtering matching original logic
                    const queryTokens = query.toLowerCase().split(/[^a-z0-9\u00C0-\u024F]+/).filter(t => t.length > 2);
                    const nameLower = name.toLowerCase();
                    const hasAllTokens = queryTokens.length === 0 || queryTokens.every(token => nameLower.includes(token));

                    const negativeKeywords = ['vallejo', 'ak interactive', 'citadel', 'army painter', 'pigment', 'štětce', 'barvy', 'colors'];
                    const hasNegativeKeyword = negativeKeywords.some(kw => nameLower.includes(kw));

                    if (hasAllTokens && !hasNegativeKeyword && !isNaN(price)) {
                        results.push({
                            name,
                            price,
                            currency: 'CZK',
                            availability,
                            link,
                            shopName: 'Imago CZ',
                            imageUrl: image,
                        });
                    }
                } catch (err) {
                    console.error('ImagoCZScraper: Error parsing item', err);
                }
            });

        } catch (error) {
            console.error('ImagoCZScraper: Error', error);
        }

        return results;
    }
}

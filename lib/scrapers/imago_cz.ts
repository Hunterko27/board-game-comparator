import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class ImagoCZScraper implements Scraper {
    name = 'Imago CZ';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const url = `https://www.imago.cz/hledani/${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2' });

            // Wait for products to load
            try {
                await page.waitForSelector('.item.product', { timeout: 5000 });
            } catch (e) {
                // No products found or timeout
                return [];
            }

            const products = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.item.product');
                return Array.from(items).map((item) => {
                    const button = item.querySelector('button.addToCart');
                    const linkEl = item.querySelector('a.absolute-link');

                    if (!button || !linkEl) return null;

                    const name = button.getAttribute('product_name') || '';
                    const priceStr = button.getAttribute('product_price') || '';
                    const price = parseFloat(priceStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
                    const image = 'https://img.imago.cz/' + (button.getAttribute('product_image') || '');
                    const stockStatus = button.getAttribute('product_stock_status');
                    const stockQuantity = parseInt(button.getAttribute('product_stock_quantity') || '0', 10);
                    const link = (linkEl as HTMLAnchorElement).href;

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

                    // Relevance check:
                    // 1. Ensure ALL significant words from the query are in the product name (stricter than 'some')
                    const queryTokens = query.toLowerCase().split(/[^a-z0-9\u00C0-\u024F]+/).filter(t => t.length > 2);
                    const nameLower = name.toLowerCase();
                    const hasAllTokens = queryTokens.length === 0 || queryTokens.every(token => nameLower.includes(token));

                    // 2. Filter out common non-board-game items (paints, accessories)
                    const negativeKeywords = ['vallejo', 'ak interactive', 'citadel', 'army painter', 'pigment', 'štětce', 'barvy', 'colors'];
                    const hasNegativeKeyword = negativeKeywords.some(kw => nameLower.includes(kw));

                    if (!hasAllTokens || hasNegativeKeyword) return null;

                    const result: SearchResult = {
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link,
                        shopName: 'Imago CZ',
                        imageUrl: image,
                    };
                    return result;
                }).filter((item): item is SearchResult => item !== null);
            }, query);

            return products;
        } catch (error) {
            console.error('ImagoCZScraper error:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}

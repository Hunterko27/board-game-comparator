import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class FuntasticScraper implements Scraper {
    name = 'Funtastic';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            const searchUrl = `https://www.funtastic.sk/search-engine.htm?slovo=${encodeURIComponent(query)}&search_submit=&hledatjak=2`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                }
            });

            const html = await response.text();
            const $ = cheerio.load(html);

            $('.productBody').each((_, element) => {
                try {
                    const $el = $(element);
                    const nameEl = $el.find('.productTitle a');
                    const name = nameEl.text().trim();
                    const link = nameEl.attr('href');

                    // Price is in a text node or span within .product_price_text
                    const priceText = $el.find('.product_price_text').text().trim();
                    const price = priceText ? parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) : NaN;

                    const imgEl = $el.find('.img_box img');
                    let imageUrl = imgEl.attr('src');
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `https://www.funtastic.sk${imageUrl}`;
                    }

                    let availability = 'Unknown';
                    const stockText = $el.find('.stock_yes').text().trim();
                    if (stockText) {
                        availability = 'In Stock';
                    } else if ($el.find('.stock_no').length > 0) {
                        availability = 'Out of Stock';
                    }

                    if (name && !isNaN(price)) {
                        results.push({
                            name,
                            price,
                            currency: 'EUR',
                            availability,
                            link: link ? (link.startsWith('http') ? link : `https://www.funtastic.sk${link}`) : undefined,
                            imageUrl: imageUrl || '',
                            shopName: 'Funtastic'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing product:', err);
                }
            });

        } catch (error) {
            console.error('Funtastic scraper error:', error);
        }
        return results;
    }
}

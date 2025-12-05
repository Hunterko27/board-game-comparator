import { Scraper, SearchResult } from './types';
import * as cheerio from 'cheerio';

export class MegaknihyScraper implements Scraper {
    name = 'Megaknihy';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            const url = `https://www.megaknihy.sk/vyhladavanie?q=${encodeURIComponent(query)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                }
            });

            const html = await response.text();
            const $ = cheerio.load(html);

            $('li.ajax_block_product').each((_, element) => {
                try {
                    const $el = $(element);
                    const nameEl = $el.find('h2 a');
                    const name = nameEl.text().trim();
                    const link = nameEl.attr('href');

                    const priceEl = $el.find('.price');
                    const priceText = priceEl.text().trim();
                    const price = priceText ? parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) : NaN;

                    const imgEl = $el.find('.product_img_link img');
                    let imageUrl = imgEl.attr('src');
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `https://www.megaknihy.sk${imageUrl}`;
                    }

                    const availability = $el.find('.product-available').text().trim() || 'Neznáma';

                    if (name && !isNaN(price)) {
                        // Strict filtering: check if name contains all query words (case-insensitive)
                        const queryWords = query.toLowerCase().split(/\s+/);
                        const nameLower = name.toLowerCase();
                        const isNameRelevant = queryWords.every(word => nameLower.includes(word));

                        // Category filtering
                        const gameKeywords = ['spolocenske', 'stolove', 'rodinne', 'kartove', 'hry', 'puzzle', 'hlavolamy', 'hracky', 'nezaradene'];
                        const isGame = link ? gameKeywords.some(keyword => link.toLowerCase().includes(keyword)) : false;

                        if (isNameRelevant && isGame && link) {
                            results.push({
                                name,
                                price,
                                currency: 'EUR',
                                availability,
                                link: link.startsWith('http') ? link : `https://www.megaknihy.sk${link}`,
                                imageUrl: imageUrl || '',
                                shopName: 'Megaknihy'
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error parsing product:', err);
                }
            });

        } catch (error) {
            console.error('Megaknihy scraper error:', error);
        }
        return results;
    }
}

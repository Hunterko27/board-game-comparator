import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class MegaknihyScraper implements Scraper {
    name = 'Megaknihy';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            const url = `https://www.megaknihy.sk/vyhladavanie?q=${encodeURIComponent(query)}`;
            console.log(`MegaknihyScraper: Navigating to ${url}`);
            // Use domcontentloaded as networkidle2 often times out due to tracking scripts
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for the product list to appear
            await page.waitForSelector('li.ajax_block_product', { timeout: 10000 });

            const productData = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('li.ajax_block_product');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('h2 a');
                        const name = nameEl?.textContent?.trim() || '';
                        const link = (nameEl as HTMLAnchorElement)?.href || '';

                        const priceEl = item.querySelector('.price');
                        const priceText = priceEl?.textContent?.trim() || '';
                        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));

                        const imgEl = item.querySelector('.product_img_link img');
                        const imageUrl = (imgEl as HTMLImageElement)?.src || '';

                        const availEl = item.querySelector('.product-available');
                        const availability = availEl?.textContent?.trim() || 'Neznáma';

                        if (name && !isNaN(price)) {
                            // Strict filtering: check if name contains all query words (case-insensitive)
                            const queryWords = query.toLowerCase().split(/\s+/);
                            const nameLower = name.toLowerCase();
                            const isNameRelevant = queryWords.every(word => nameLower.includes(word));

                            // Category filtering: check if link contains game-related keywords
                            const gameKeywords = ['spolocenske', 'stolove', 'rodinne', 'kartove', 'hry', 'puzzle', 'hlavolamy', 'hracky', 'nezaradene'];
                            const isGame = gameKeywords.some(keyword => link.toLowerCase().includes(keyword));

                            if (isNameRelevant && isGame) {
                                data.push({
                                    name,
                                    price,
                                    currency: 'EUR',
                                    availability,
                                    link: link.startsWith('http') ? link : `https://www.megaknihy.sk${link}`,
                                    imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.megaknihy.sk${imageUrl}`,
                                    shopName: 'Megaknihy'
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error parsing product:', err);
                    }
                });

                return data;
            }, query);

            results.push(...productData);

        } catch (error) {
            console.error('MegaknihyScraper: Error during search', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}

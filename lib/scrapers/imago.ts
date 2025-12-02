import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class ImagoScraper implements Scraper {
    name = 'Imago';
    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            const searchUrl = `https://www.imago.sk/index.php?route=product/search&keyword=${encodeURIComponent(query)}`;

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            const results = await page.evaluate((query: string) => {
                // Use specific container to avoid autocomplete dropdowns
                const items = document.querySelectorAll('#productsArea .product-list-item');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        const nameEl = item.querySelector('.vypis_h3 a');
                        const linkEl = item.querySelector('.vypis_h3 a');
                        const priceEl = item.querySelector('.vypis_cena');
                        const imgEl = item.querySelector('.img-productsarea');
                        const availEl = item.querySelector('.skladem');
                        const onWayEl = item.querySelector('.na_ceste');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (linkEl as HTMLAnchorElement)?.href || '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Remove '€' and replace ',' with '.' and remove spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '');
                        const price = parseFloat(priceText);

                        // Prefer data-src for lazy loaded images
                        const imageUrl = (imgEl as HTMLImageElement)?.dataset.src || (imgEl as HTMLImageElement)?.src || '';

                        let availability = 'Nedostupné';
                        if (availEl) {
                            availability = availEl.textContent?.trim() || 'Skladom';
                        } else if (onWayEl) {
                            availability = onWayEl.textContent?.trim() || 'Na ceste';
                        }

                        if (name && !isNaN(price)) {
                            // Strict filtering: check if name contains query (case-insensitive)
                            if (name.toLowerCase().includes(query.toLowerCase())) {
                                data.push({
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
                        console.error('Error parsing product:', err);
                    }
                });

                return data;
            }, query);

            return results;
        } catch (error) {
            console.error('Imago scraper error:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}

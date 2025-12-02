import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class AlzaScraper implements Scraper {
    name = 'Alza';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Set User-Agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        try {
            const searchUrl = `https://www.alza.sk/search.htm?exps=${encodeURIComponent(query)}`;

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            // Handle cookie consent if present (Alza often has a popup)
            try {
                const cookieBtn = await page.$('.js-cookies-info-accept');
                if (cookieBtn) {
                    await cookieBtn.click();
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) {
                // Ignore if no cookie popup
            }

            // Wait for potential product containers
            try {
                await page.waitForSelector('.box, .browsing-item', { timeout: 5000 });
            } catch (e) {
                console.log('Timeout waiting for product selector');
            }

            // Scroll down to trigger lazy loading
            await page.evaluate(async () => {
                await new Promise<void>((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeight || totalHeight > 2000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });

            // Wait a bit for images to load
            await new Promise(r => setTimeout(r, 1000));

            const results = await page.evaluate((query: string) => {
                const items = document.querySelectorAll('.box, .browsing-item');
                const data: any[] = [];

                items.forEach((item) => {
                    try {
                        // Try multiple selectors for name
                        const nameEl = item.querySelector('.name, .browsing-item__name, .title');
                        // Try multiple selectors for price
                        const priceEl = item.querySelector('.price-box__price, .price, .price-box__primary-price');
                        // Try multiple selectors for image
                        const imgEl = item.querySelector('img');
                        // Try multiple selectors for availability
                        const availEl = item.querySelector('.avl, .availability, .stock-availability');

                        const name = nameEl?.textContent?.trim() || '';
                        const link = (nameEl as HTMLAnchorElement)?.href || (item.querySelector('a') as HTMLAnchorElement)?.href || '';

                        let priceText = priceEl?.textContent?.trim() || '';
                        // Remove '€', replace ',' with '.', remove spaces and non-breaking spaces
                        priceText = priceText.replace(/€/g, '').replace(',', '.').replace(/\s/g, '').replace(/\u00A0/g, '');
                        const price = parseFloat(priceText);

                        let imageUrl = '';
                        if (imgEl) {
                            // Prioritize data-src or dataset.src
                            imageUrl = imgEl.getAttribute('data-src') ||
                                (imgEl as HTMLElement).dataset.src ||
                                (imgEl as HTMLImageElement).src || '';

                            // If still placeholder, try to find other attributes
                            if (imageUrl.includes('placeholder')) {
                                const possibleAttrs = ['data-src', 'data-original', 'data-srcset'];
                                for (const attr of possibleAttrs) {
                                    const val = imgEl.getAttribute(attr);
                                    if (val) {
                                        imageUrl = val.split(' ')[0]; // Take first URL if srcset
                                        break;
                                    }
                                }
                            }
                        }

                        const availability = availEl?.textContent?.trim() || 'Neznáme';

                        // Filter out empty or invalid items (e.g. ads)
                        if (name && !isNaN(price) && link) {
                            // Strict filtering: check if name contains query (case-insensitive)
                            if (name.toLowerCase().includes(query.toLowerCase())) {
                                data.push({
                                    name,
                                    price,
                                    currency: 'EUR',
                                    availability,
                                    link,
                                    imageUrl,
                                    shopName: 'Alza'
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
            console.error('Alza scraper error:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}

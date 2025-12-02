import { Scraper, SearchResult } from './types';
import { getBrowser } from '../browser';

export class RerollScraper implements Scraper {
    name = 'Reroll';

    async search(query: string): Promise<SearchResult[]> {
        const browser = await getBrowser();
        const page = await browser.newPage();
        const results: SearchResult[] = [];

        try {
            console.log('RerollScraper: Navigating to homepage...');

            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

            // Set value explicitly and submit form
            console.log(`RerollScraper: Searching for "${query}"...`);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.evaluate((q: string) => {
                    const input = document.querySelector('input[name="q"]') as HTMLInputElement;
                    if (input) input.value = q;
                    const form = document.querySelector('form[name="search"]') as HTMLFormElement;
                    if (form) form.submit();
                }, query)
            ]);

            const productElements = await page.$$('.p_cart_block');
            console.log(`RerollScraper: Found ${productElements.length} elements.`);

            for (const element of productElements) {
                try {
                    const nameEl = await element.$('.p_title a span[itemprop="name"]');
                    const name = nameEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', nameEl) : '';

                    const priceEl = await element.$('.p_price');
                    const priceText = priceEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', priceEl) : '';
                    const price = this.parsePrice(priceText);

                    const linkEl = await element.$('.p_title a');
                    const link = linkEl ? await page.evaluate((el: any) => el.getAttribute('href') || '', linkEl) : '';

                    const imageEl = await element.$('.p_img img');
                    const imageUrl = imageEl ? await page.evaluate((el: any) => el.getAttribute('src') || '', imageEl) : '';

                    // Check availability
                    // Look for "Nesehnatelné" label
                    const labelEl = await element.$('.p_label_green');
                    const labelText = labelEl ? await page.evaluate((el: any) => el.textContent?.trim() || '', labelEl) : '';
                    const isAvailable = !labelText.includes('Nesehnatelné');

                    if (name && price > 0) {
                        results.push({
                            name,
                            price,
                            currency: 'CZK',
                            availability: isAvailable ? 'Skladem' : 'Není skladem',
                            link: link.startsWith('http') ? link : `https://www.reroll.cz${link}`,
                            imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.reroll.cz${imageUrl}`,
                            shopName: 'Reroll'
                        });
                    }
                } catch (err) {
                    console.error('Error parsing Reroll product:', err);
                }
            }
        } catch (error) {
            console.error('Error scraping Reroll:', error);
        } finally {
            await page.close();
        }

        return results;
    }

    private parsePrice(priceText: string): number {
        return parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
    }
}

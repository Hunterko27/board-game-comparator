import { Scraper, SearchResult } from './types';

export class AlbiCZScraper implements Scraper {
    name = 'Albi CZ';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            // 1. Get the API Token from homepage
            const homeResponse = await fetch('https://eshop.albi.cz/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const homeHtml = await homeResponse.text();

            const tokenMatch = homeHtml.match(/apiToken:\s*'([a-f0-9]+)'/);
            if (!tokenMatch) {
                console.error('AlbiCZScraper: Could not find API token');
                return [];
            }
            const token = tokenMatch[1];

            // 2. Call the Search API
            const apiUrl = `https://api.upsearch.cz/search?q=${encodeURIComponent(query)}&p=1`;
            const apiResponse = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Origin': 'https://eshop.albi.cz',
                    'Referer': `https://eshop.albi.cz/vyhledavani/?q=${encodeURIComponent(query)}`,
                    'token': token
                }
            });

            if (!apiResponse.ok) {
                console.error(`AlbiCZScraper: API failed with status ${apiResponse.status}`);
                return [];
            }

            const data = await apiResponse.json();

            if (data.data && data.data.items) {
                for (const item of data.data.items) {
                    // Strict filtering
                    const name = item.name;

                    let priceVal = 0;
                    if (item.price_vat) {
                        priceVal = typeof item.price_vat === 'string' ? parseFloat(item.price_vat) : item.price_vat;
                    } else if (item.price) {
                        priceVal = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    }

                    if (name.toLowerCase().includes(query.toLowerCase()) && !name.toLowerCase().includes('rozšíření')) {

                        const link = item.link || item.url;
                        const finalLink = link.startsWith('http') ? link : `https://eshop.albi.cz${link}`;

                        const rawImage = item.image_link || item.image_2x_link || item.image;
                        const imageUrl = rawImage ? (rawImage.startsWith('http') ? rawImage : `https://eshop.albi.cz${rawImage}`) : '';

                        results.push({
                            name: name,
                            price: isNaN(priceVal) ? 0 : priceVal,
                            currency: 'CZK',
                            availability: item.in_stock ? 'Skladem' : 'Nedostupné',
                            link: finalLink,
                            imageUrl: imageUrl,
                            shopName: 'Albi CZ'
                        });
                    }
                }
            }

        } catch (error) {
            console.error('AlbiCZScraper: Error', error);
        }

        return results;
    }
}

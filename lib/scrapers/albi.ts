import { Scraper, SearchResult } from './types';

export class AlbiScraper implements Scraper {
    name = 'Albi';

    async search(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        try {
            // 1. Get the API Token from homepage
            const homeResponse = await fetch('https://eshop.albi.sk/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const homeHtml = await homeResponse.text();

            const tokenMatch = homeHtml.match(/apiToken:\s*'([a-f0-9]+)'/);
            if (!tokenMatch) {
                console.error('AlbiScraper: Could not find API token');
                return [];
            }
            const token = tokenMatch[1];

            // 2. Call the Search API
            const apiUrl = `https://api.upsearch.cz/search?q=${encodeURIComponent(query)}&p=1`;
            const apiResponse = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Origin': 'https://eshop.albi.sk',
                    'Referer': `https://eshop.albi.sk/vyhladavanie/?q=${encodeURIComponent(query)}`,
                    'token': token
                }
            });

            if (!apiResponse.ok) {
                console.error(`AlbiScraper: API failed with status ${apiResponse.status}`);
                return [];
            }

            const data = await apiResponse.json();

            if (data.data && data.data.items) {
                for (const item of data.data.items) {
                    // Strict filtering
                    if (item.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            name: item.name,
                            let priceVal = 0;
                            if(item.price_vat) {
                            priceVal = typeof item.price_vat === 'string' ? parseFloat(item.price_vat) : item.price_vat;
                        } else if (item.price) {
                            priceVal = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                        }

                        results.push({
                            name: item.name,
                            price: isNaN(priceVal) ? 0 : priceVal,
                            currency: 'EUR',
                            availability: item.availability?.in_stock ? 'Skladom' : 'Nedostupné',
                            link: item.url,
                            imageUrl: item.image,
                            shopName: 'Albi'
                        });
                    }
                }
            }

        } catch (error) {
            console.error('AlbiScraper: Error', error);
        }

        return results;
    }
}

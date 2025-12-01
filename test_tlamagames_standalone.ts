import * as cheerio from 'cheerio';

interface SearchResult {
    name: string;
    price: number;
    currency: string;
    availability: string;
    link: string;
    shopName: string;
    shippingCost?: number;
    imageUrl?: string;
}

interface Scraper {
    name: string;
    search(query: string): Promise<SearchResult[]>;
}

class TlamaGamesScraper implements Scraper {
    name = 'TlamaGames';
    async search(query: string): Promise<SearchResult[]> {
        const url = `https://www.tlamagames.com/vyhledavani/?string=${encodeURIComponent(query)}`;
        const results: SearchResult[] = [];

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = await response.text();
            const $ = cheerio.load(html);

            $('.product').each((_, element) => {
                const $element = $(element);

                const titleElement = $element.find('.name');
                const title = titleElement.text().trim();
                const link = $element.find('a').attr('href') || '';
                const fullLink = link.startsWith('http') ? link : `https://www.tlamagames.com${link}`;

                const priceElement = $element.find('.price');
                const priceText = priceElement.text().trim();
                const price = parseFloat(priceText.replace(/\s/g, '').replace('Kč', '').replace(',', '.'));

                const availabilityElement = $element.find('.availability');
                const availabilityText = availabilityElement.text().trim();
                const availability = availabilityText.replace(/\s+/g, ' ').trim();

                const imageElement = $element.find('img');
                let imageUrl = imageElement.attr('data-src') || imageElement.attr('src') || '';
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                if (title && !isNaN(price)) {
                    results.push({
                        name: title,
                        price: price,
                        currency: 'CZK',
                        availability: availability,
                        link: fullLink,
                        shopName: 'TlamaGames',
                        imageUrl: imageUrl
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping tlamagames.com:', error);
        }

        return results;
    }
}

async function test() {
    const scraper = new TlamaGamesScraper();
    console.log('Testing TlamaGamesScraper...');
    const results = await scraper.search('catan');
    console.log(`Found ${results.length} results:`);
    results.forEach(r => {
        console.log(`- ${r.name} (${r.price} ${r.currency}) [${r.availability}]`);
        console.log(`  Link: ${r.link}`);
        console.log(`  Image: ${r.imageUrl}`);
    });
}

test();

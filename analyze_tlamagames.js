const cheerio = require('cheerio');

async function analyzeTlama() {
    const query = 'catan';
    const url = `https://www.tlamagames.com/vyhledavani/?string=${encodeURIComponent(query)}`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('Response status:', response.status);
        const html = await response.text();
        const $ = cheerio.load(html);

        console.log('Page title:', $('title').text());

        // Look for product items
        // TlamaGames might be Shoptet too?
        const items = $('.product, .p-item, .product-item, .item, .p');
        console.log(`Found ${items.length} items.`);

        if (items.length > 0) {
            const firstItem = items.first();
            console.log('First item class:', firstItem.attr('class'));
            // console.log('First item HTML:', firstItem.html());

            const title = firstItem.find('.name, h2, h3').text().trim();
            const price = firstItem.find('.price, .price-final').text().trim();
            const availability = firstItem.find('.availability, .stock').text().trim();
            const link = firstItem.find('a').attr('href');

            console.log('Extracted (Guess):');
            console.log('Title:', title);
            console.log('Price:', price);
            console.log('Availability:', availability);
            console.log('Link:', link);
        } else {
            const main = $('main, #content, #main, .content').first();
            console.log('Main content HTML snippet:', main.html()?.substring(0, 1000));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

analyzeTlama();

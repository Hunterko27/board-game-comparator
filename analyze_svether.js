const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Try to navigate to search page directly or main page and search
    // Common patterns: /vyhledavani?q=, /search?q=, /?s=
    const query = 'Catan';
    const url = `https://www.svet-her.cz/Vyhledavani?fraze=${query}`;

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Save HTML for inspection
    const html = await page.content();
    fs.writeFileSync('svether_search.html', html);
    console.log('Saved svether_search.html');

    // Take a screenshot
    await page.screenshot({ path: 'svether_search.png', fullPage: true });
    console.log('Saved svether_search.png');

    // Test extraction logic
    const products = await page.evaluate(() => {
        const items = [];
        const productElements = document.querySelectorAll('.product-list .product');

        productElements.forEach((el) => {
            const nameElement = el.querySelector('h3 a');
            const name = nameElement?.textContent?.trim();
            const link = nameElement?.getAttribute('href');

            const priceElement = el.querySelector('.price');
            const priceText = priceElement?.textContent?.trim();
            const price = priceText ? parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) : NaN;

            const imageElement = el.querySelector('.img img');
            let imageUrl = imageElement?.src;

            if (imageUrl && imageUrl.startsWith('data:')) {
                const srcset = imageElement.getAttribute('srcset');
                if (srcset) {
                    const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
                    if (firstSrc) {
                        imageUrl = firstSrc;
                    }
                } else {
                    const dataSrc = imageElement.getAttribute('data-src');
                    if (dataSrc) {
                        imageUrl = dataSrc;
                    }
                }
            }

            if (imageUrl && imageUrl.startsWith('//')) {
                imageUrl = `https:${imageUrl}`;
            }

            let availability = 'Unknown';
            const availabilityElement = el.querySelector('.js_dostupnost');
            const availabilityText = availabilityElement?.textContent?.trim();

            if (availabilityText) {
                if (availabilityText.toLowerCase().includes('skladem')) {
                    availability = 'In Stock';
                } else if (availabilityText.toLowerCase().includes('není skladem') || availabilityText.toLowerCase().includes('vyprodáno')) {
                    availability = 'Out of Stock';
                } else if (availabilityText.toLowerCase().includes('předobjednávka') || availabilityText.toLowerCase().includes('očekáváme')) {
                    availability = 'Pre-order';
                }
            }

            if (name && !isNaN(price)) {
                items.push({
                    name,
                    price,
                    currency: 'CZK',
                    availability,
                    link: link ? (link.startsWith('http') ? link : `https://www.svet-her.cz${link}`) : undefined,
                    imageUrl,
                    shopName: 'Svět Her'
                });
            }
        });

        return items;
    });

    console.log('Extracted products:', JSON.stringify(products, null, 2));

    await browser.close();
})();

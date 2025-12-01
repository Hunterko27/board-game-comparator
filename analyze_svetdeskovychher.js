const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to homepage first
    const url = 'https://www.svet-deskovych-her.cz/';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Type into search box
        console.log('Typing query...');
        await page.waitForSelector('#thProduct');
        await page.type('#thProduct', 'Catan');

        // Submit search
        console.log('Submitting search...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button[aria-label="Hledej"]')
        ]);

        console.log('Search submitted. Current URL:', page.url());

        // Save HTML for inspection
        const html = await page.content();
        fs.writeFileSync('svetdeskovychher_search.html', html);
        console.log('Saved svetdeskovychher_search.html');

        // Take a screenshot
        await page.screenshot({ path: 'svetdeskovychher_search.png', fullPage: true });
        console.log('Saved svetdeskovychher_search.png');

        // Test extraction logic
        const products = await page.evaluate(() => {
            const items = [];
            const productElements = document.querySelectorAll('#productsList .list-products li');

            productElements.forEach((el) => {
                const nameElement = el.querySelector('h3.item-name');
                const name = nameElement?.textContent?.trim();

                const linkElement = el.querySelector('a');
                const link = linkElement?.getAttribute('href');
                const fullLink = link ? (link.startsWith('http') ? link : `https://www.svet-deskovych-her.cz/${link.replace(/^\//, '')}`) : undefined;

                const imageElement = el.querySelector('.item-img img');
                let imageUrl = imageElement?.src;
                if (imageUrl && imageUrl.startsWith('//')) {
                    imageUrl = `https:${imageUrl}`;
                }

                const priceElement = el.querySelector('.text-price');
                const priceText = priceElement?.textContent?.replace(/\s+/g, '').replace('Kč', '').replace(',', '.');
                const price = priceText ? parseFloat(priceText) : NaN;

                let availability = 'Unknown';
                const availabilityElement = el.querySelector('.item-text p');
                const availabilityText = availabilityElement?.textContent?.trim().toLowerCase();

                if (availabilityText) {
                    if (availabilityText.includes('skladem')) {
                        availability = 'In Stock';
                    } else if (availabilityText.includes('není skladem') || availabilityText.includes('vyprodáno') || availabilityText.includes('nemá vydavatel')) {
                        availability = 'Out of Stock';
                    } else if (availabilityText.includes('předobjednávka') || availabilityText.includes('očekáváme')) {
                        availability = 'Pre-order';
                    }
                }

                if (name && !isNaN(price)) {
                    items.push({
                        name,
                        price,
                        currency: 'CZK',
                        availability,
                        link: fullLink,
                        imageUrl,
                        shopName: 'Svět deskových her'
                    });
                }
            });

            return items;
        });

        console.log('Extracted products:', JSON.stringify(products, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }

    await browser.close();
})();

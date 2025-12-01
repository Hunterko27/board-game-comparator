const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://eshop.albi.sk/catan/';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        await new Promise(r => setTimeout(r, 3000));

        const products = await page.evaluate(() => {
            const items = [];
            // Try different selectors
            const productEls = document.querySelectorAll(`.rf-Product, [class*="product"]`);

            productEls.forEach(el => {
                // Get the outer HTML of first product for analysis
                if (items.length === 0) {
                    items.push({ fullHTML: el.outerHTML.substring(0, 1000) });
                }

                // Try to extract basic info
                const nameEl = el.querySelector('[class*="name"], [class*="title"], h3, h2');
                const priceEl = el.querySelector('[class*="price"], [class*="cena"]');
                const linkEl = el.querySelector('a[href*="/"]');

                items.push({
                    name: nameEl?.textContent?.trim() || 'NO NAME',
                    price: priceEl?.textContent?.trim() || 'NO PRICE',
                    link: linkEl?.href || 'NO LINK',
                    classes: el.className
                });
            });

            return items;
        });

        console.log(`Found ${products.length} products`);
        console.log(JSON.stringify(products.slice(0, 3), null, 2));

        // Save HTML
        const html = await page.content();
        fs.writeFileSync('albi_category.html', html);
        console.log('Saved to albi_category.html');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

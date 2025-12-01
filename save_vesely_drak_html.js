const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.vesely-drak.sk/vyhladavanie?string=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        // Save full HTML
        const html = await page.content();
        fs.writeFileSync('vesely_drak_search.html', html);
        console.log('Saved HTML to vesely_drak_search.html');

        // Look for product container patterns
        const patterns = await page.evaluate(() => {
            const results = {};

            // Try common e-commerce selectors
            const selectors = [
                '.product-item',
                '.product-card',
                '[data-product]',
                '[data-product-id]',
                '.item',
                '.box-product',
                'article',
            ];

            selectors.forEach(sel => {
                const count = document.querySelectorAll(sel).length;
                if (count > 0) {
                    results[sel] = count;
                }
            });

            return results;
        });

        console.log('\nFound selectors:');
        console.log(JSON.stringify(patterns, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

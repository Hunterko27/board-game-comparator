const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://eshop.albi.sk/vyhladavanie/?string=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Check what's on the page
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title,
                hasProducts: document.querySelectorAll('.rf-Product').length,
                hasProductClass: document.querySelectorAll('.product').length,
                hasDataProduct: document.querySelectorAll('[data-product]').length,
                firstProductHTML: document.querySelector('.rf-Product, .product, [data-product]')?.outerHTML.substring(0, 500)
            };
        });

        console.log('Page info:', JSON.stringify(pageInfo, null, 2));

        // Try to find the actual product container
        const html = await page.content();
        const productMatches = html.match(/<div[^>]*class="[^"]*product[^"]*"[^>]*>/gi);
        if (productMatches) {
            console.log('\nFound product divs:', productMatches.slice(0, 3));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

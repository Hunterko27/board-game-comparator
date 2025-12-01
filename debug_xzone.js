const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search for "Catan" on xzone.sk
    // Assuming standard search URL pattern or we can try to find the search input
    // Let's try direct URL first if possible, otherwise navigate
    // Xzone.sk search url seems to be /vyhledavani?q=query

    const query = 'Catan';
    const url = `https://www.xzone.sk/hledat?q=${query}`;

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Save HTML
    const html = await page.content();
    fs.writeFileSync('xzone_search_result.html', html);
    console.log('Saved HTML to xzone_search_result.html');

    // Try to count products
    const count = await page.evaluate(() => {
        // Try common selectors
        return document.querySelectorAll('.product-item, .item, .card, article').length;
    });
    console.log(`Products found (heuristic): ${count}`);

    await browser.close();
})();

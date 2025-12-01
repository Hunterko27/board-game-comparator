const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Search for "Catan" to get some results
    const query = 'Catan';
    const url = `https://www.planetaher.cz/vyhledavani?string=${query}`;

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Save HTML for inspection
    const html = await page.content();
    fs.writeFileSync('planetaher_search.html', html);
    console.log('Saved HTML to planetaher_search.html');

    // Take a screenshot
    await page.screenshot({ path: 'planetaher_search.png', fullPage: true });
    console.log('Saved screenshot to planetaher_search.png');

    // Try to extract items
    const items = await page.evaluate(() => {
        const results = [];
        // Try to guess selectors based on common patterns or inspect the saved HTML later
        // Looking for product cards
        const products = document.querySelectorAll('.product');

        products.forEach(p => {
            const nameEl = p.querySelector('.productName');
            const priceEl = p.querySelector('.price');
            const availEl = p.querySelector('.availability');

            results.push({
                name: nameEl ? nameEl.innerText.trim() : 'N/A',
                price: priceEl ? priceEl.innerText.trim() : 'N/A',
                availability: availEl ? availEl.innerText.trim() : 'N/A',
                html: p.outerHTML.substring(0, 100) + '...'
            });
        });
        return results;
    });

    console.log('Extracted items (guess):', items);

    await browser.close();
})();

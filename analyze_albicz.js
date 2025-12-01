const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to albi.cz search
    const query = 'Catan';
    const url = `https://eshop.albi.cz/vyhledavani/?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Save HTML for inspection
        const html = await page.content();
        fs.writeFileSync('albicz_search.html', html);
        console.log('Saved albicz_search.html');

        // Take a screenshot
        await page.screenshot({ path: 'albicz_search.png', fullPage: true });
        console.log('Saved albicz_search.png');

    } catch (e) {
        console.error('Error:', e);
    }

    await browser.close();
})();

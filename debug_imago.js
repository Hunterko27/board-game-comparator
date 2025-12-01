const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // Based on batch_test_sites.js: https://www.imago.sk/search?q=Catan
        const url = 'https://www.imago.sk/index.php?route=product/search&keyword=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const content = await page.content();
        fs.writeFileSync('imago_debug.html', content);
        console.log('Saved HTML to imago_debug.html');

        await page.screenshot({ path: 'imago_debug.png', fullPage: true });
        console.log('Saved screenshot to imago_debug.png');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

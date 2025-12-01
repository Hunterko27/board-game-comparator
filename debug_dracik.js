const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // Based on batch_test_sites.js
        const url = 'https://www.dracik.sk/search/?search=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for potential product list container
        // Common selectors: .product, .item, .card
        try {
            await page.waitForSelector('body', { timeout: 5000 });
        } catch (e) {
            console.log('Timeout waiting for body');
        }

        const html = await page.content();
        fs.writeFileSync('dracik_debug.html', html);
        console.log('Saved HTML to dracik_debug.html');

        // Take a screenshot
        await page.screenshot({ path: 'dracik_debug.png' });
        console.log('Saved screenshot to dracik_debug.png');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

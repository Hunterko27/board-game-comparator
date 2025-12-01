const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const url = 'https://www.ludopolis.sk/sk/vyhladavanie/?keyword=osadnici&search=true';
        console.log('Navigating to:', url);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Check for cookie banner
        try {
            console.log('Waiting for cookie banner...');
            await page.waitForSelector('.cookies_panel_2022_btn_all', { timeout: 5000 });
            console.log('Clicking cookie banner...');
            await page.click('.cookies_panel_2022_btn_all');
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.log('Cookie banner not found or timeout:', e.message);
        }

        console.log('Waiting for content...');
        // Wait for product list selector. I suspect it might be .product-item or similar.
        // I'll wait for a generic container or just time.
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('ludopolis_dump_3.html', html);
        console.log('HTML dumped to ludopolis_dump_3.html');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const url = 'https://www.megaknihy.sk/vyhladavanie?q=Catan';

    console.log(`Navigating to ${url}...`);
    try {
        // Use domcontentloaded instead of networkidle2 to avoid timeouts on persistent connections
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('Page loaded (domcontentloaded). Waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'megaknihy_debug.png' });

        console.log('Saving HTML...');
        const html = await page.content();
        fs.writeFileSync('megaknihy_debug.html', html);

        const products = await page.evaluate(() => {
            return document.querySelectorAll('li.ajax_block_product').length;
        });
        console.log(`Found ${products} products with selector li.ajax_block_product`);

        const title = await page.title();
        console.log(`Page title: ${title}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

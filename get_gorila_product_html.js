const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.gorila.sk/vyhladavanie?q=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        await new Promise(r => setTimeout(r, 7000));

        // Get first product div HTML
        const firstProductHTML = await page.evaluate(() => {
            const products = document.querySelectorAll('div[class*="product"]');
            if (products.length > 0) {
                return products[0].outerHTML;
            }
            return 'No products';
        });

        console.log('First product HTML:');
        console.log(firstProductHTML.substring(0, 1500));

        // Save full page
        const html = await page.content();
        fs.writeFileSync('gorila_full_page.html', html);
        console.log('\nSaved to gorila_full_page.html');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

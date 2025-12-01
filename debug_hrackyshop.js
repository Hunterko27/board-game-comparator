const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // Use search_keywords instead of q
    const url = 'https://www.hrackyshop.sk/hladaj?search_keywords=Catan';

    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'hrackyshop_debug.png' });

        console.log('Saving HTML...');
        const html = await page.content();
        fs.writeFileSync('hrackyshop_debug.html', html);

        const products = await page.evaluate(() => {
            // Use .product_box_cont as the container
            const items = document.querySelectorAll('.product_box_cont');
            return Array.from(items).map(item => {
                const nameEl = item.querySelector('h2.product_name');
                const linkEl = item.querySelector('a.product_box');
                const priceEl = item.querySelector('.product_discounted_price') || item.querySelector('.product_base_price');
                const imgEl = item.querySelector('.product_image img');
                const availEl = item.querySelector('.stock_state_icon');

                return {
                    name: nameEl ? nameEl.textContent.trim() : 'N/A',
                    price: priceEl ? priceEl.textContent.trim() : 'N/A',
                    link: linkEl ? linkEl.href : 'N/A',
                    image: imgEl ? imgEl.src : 'N/A',
                    availability: availEl ? availEl.textContent.trim() : 'N/A'
                };
            });
        });
        console.log(`Found ${products.length} items. Top 3:`);
        console.log(JSON.stringify(products.slice(0, 3), null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

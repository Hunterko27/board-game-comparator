const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.funtastic.sk/hladaj?q=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        await new Promise(r => setTimeout(r, 3000));

        // Analyze first 3 products
        const products = await page.evaluate(() => {
            const items = document.querySelectorAll('[class*="product"], .product, article');
            const results = [];

            for (let i = 0; i < Math.min(3, items.length); i++) {
                const item = items[i];
                const nameEl = item.querySelector('[class*="name"], [class*="title"], h2, h3, a[href*="/produkt/"], a[href*="/hra/"]');
                const priceEl = item.querySelector('[class*="price"], [class*="cena"]');
                const linkEl = item.querySelector('a[href*="/produkt/"], a[href*="/hra/"], a');
                const imgEl = item.querySelector('img');
                const availEl = item.querySelector('[class*="skladem"], [class*="dostupnost"], [class*="availability"]');

                results.push({
                    index: i,
                    name: nameEl?.textContent?.trim().substring(0, 60) || 'NO NAME',
                    price: priceEl?.textContent?.trim() || 'NO PRICE',
                    link: linkEl?.href || 'NO LINK',
                    img: imgEl?.src || imgEl?.getAttribute('data-src') || 'NO IMG',
                    avail: availEl?.textContent?.trim() || 'NO AVAIL',
                    className: item.className
                });
            }

            return results;
        });

        console.log('\nSample products:');
        console.log(JSON.stringify(products, null, 2));

        // Get one full product HTML
        const firstProductHTML = await page.evaluate(() => {
            const items = document.querySelectorAll('[class*="product"], .product, article');
            return items[0]?.outerHTML?.substring(0, 1200) || 'none';
        });

        fs.writeFileSync('funtastic_product_sample.html', firstProductHTML);
        console.log('\nSaved sample to funtastic_product_sample.html');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

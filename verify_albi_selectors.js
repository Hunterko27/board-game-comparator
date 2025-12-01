const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const searchUrl = 'https://eshop.albi.sk/vyhladavanie/?q=Catan';

    console.log(`Navigating to ${searchUrl}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    try {
        console.log('Waiting for .up-product-box...');
        await page.waitForSelector('.up-product-box', { timeout: 10000 });
        console.log('Selector found!');

        const product = await page.evaluate(() => {
            const item = document.querySelector('.up-product-box');
            if (!item) return null;

            const nameEl = item.querySelector('h2 a') || item.querySelector('.up-product-box__name a');
            const priceEl = item.querySelector('.up-price__actual') || item.querySelector('.price');
            const imgEl = item.querySelector('img');
            const availEl = item.querySelector('.stock-status') || item.querySelector('.up-product-box__stock');

            return {
                name: nameEl ? nameEl.textContent.trim() : 'N/A',
                link: nameEl ? nameEl.href : 'N/A',
                price: priceEl ? priceEl.textContent.trim() : 'N/A',
                image: imgEl ? imgEl.src : 'N/A',
                availability: availEl ? availEl.textContent.trim() : 'N/A'
            };
        });

        console.log('Extracted product:', product);

        const productHtml = await page.evaluate(() => {
            const item = document.querySelector('.up-product-box');
            return item ? item.innerHTML : 'Item not found';
        });
        console.log('Product HTML:', productHtml);

    } catch (error) {
        console.error('Error:', error.message);
    }

    await browser.close();
})();

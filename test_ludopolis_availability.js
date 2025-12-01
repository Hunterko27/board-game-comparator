const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.ludopolis.sk/sk/vyhladavanie/?keyword=osadnici&search=true';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Handle cookie consent
        try {
            const cookieBtnSelector = '.cookies_panel_2022_btn_all';
            if (await page.$(cookieBtnSelector)) {
                await page.click(cookieBtnSelector);
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) { }

        // Wait for products
        await page.waitForSelector('.prod_holder', { timeout: 5000 });

        // Extract availability info from first product
        const availabilityInfo = await page.evaluate(() => {
            const firstProduct = document.querySelector('.prod_holder');
            if (!firstProduct) return 'No product found';

            // Get the whole stock_status_list HTML
            const stockEl = firstProduct.querySelector('.stock_status_list');
            if (!stockEl) return 'No stock element found';

            return {
                innerHTML: stockEl.innerHTML,
                textContent: stockEl.textContent,
                outerHTML: stockEl.outerHTML
            };
        });

        console.log('Availability structure:', JSON.stringify(availabilityInfo, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

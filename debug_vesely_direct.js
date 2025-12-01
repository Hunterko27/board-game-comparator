const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const urls = [
        'https://www.vesely-drak.sk/hledat.php?hledat=Catan',
        'https://www.vesely-drak.sk/produkty/vyhledavani/?string=Catan'
    ];

    for (const url of urls) {
        console.log(`\nTesting URL: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            console.log('Waiting for .catalogue-item...');
            try {
                await page.waitForSelector('.catalogue-item', { timeout: 10000 });
                console.log('Found .catalogue-item!');

                const items = await page.evaluate(() => {
                    const elements = document.querySelectorAll('.catalogue-item');
                    return Array.from(elements).slice(0, 3).map(el => ({
                        name: el.querySelector('.product-name')?.textContent?.trim(),
                        price: el.querySelector('.price')?.textContent?.trim(),
                    }));
                });
                console.log('Top 3 items:', items);
            } catch (e) {
                console.log('Timeout waiting for .catalogue-item');
            }

        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    await browser.close();
})();

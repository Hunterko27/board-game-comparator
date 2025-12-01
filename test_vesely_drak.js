const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        // Test different URL formats
        const testUrls = [
            'https://www.vesely-drak.sk/vyhladavanie?string=Catan',
            'https://www.vesely-drak.sk/search?q=Catan',
            'https://www.vesely-drak.sk/hladaj/Catan'
        ];

        for (const url of testUrls) {
            console.log(`\nTesting: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

                const info = await page.evaluate(() => ({
                    title: document.title,
                    hasProducts: document.querySelectorAll('[class*="product"], .product, [data-product]').length
                }));

                console.log('  Title:', info.title);
                console.log('  Products found:', info.hasProducts);

                if (info.hasProducts > 0) {
                    console.log('  ✓ This URL works!');
                    break;
                }
            } catch (e) {
                console.log('  ✗ Failed:', e.message);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

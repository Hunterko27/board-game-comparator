const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const searchUrls = [
        'https://www.funtastic.sk/hladaj?q=Catan',
        'https://www.funtastic.sk/search?q=Catan',
        'https://www.funtastic.sk/vyhladavanie?q=Catan',
        'https://www.funtastic.sk/?search=Catan',
        'https://www.funtastic.sk/spolocenske-hry?q=Catan',
    ];

    for (const url of searchUrls) {
        console.log(`\n=== Testing: ${url} ===`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
            await new Promise(r => setTimeout(r, 3000));

            const pageUrl = page.url();
            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body.textContent);
            const catanCount = (bodyText.match(/catan/gi) || []).length;

            console.log(`Final URL: ${pageUrl}`);
            console.log(`Title: ${title}`);
            console.log(`"Catan" mentions: ${catanCount}`);

            if (catanCount > 0) {
                console.log('✓ THIS URL WORKS!');

                // Get product names
                const products = await page.evaluate(() => {
                    const results = [];
                    const text = document.body.textContent;
                    const regex = /catan[^\.]{0,100}/gi;
                    const matches = text.match(regex) || [];
                    return matches.slice(0, 5);
                });

                console.log('Sample mentions:', products);
                break;
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }

    await browser.close();
})();

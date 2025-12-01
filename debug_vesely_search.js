const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log('Navigating to homepage...');
        await page.goto('https://www.vesely-drak.sk/', { waitUntil: 'networkidle2' });

        console.log('Typing query...');
        await page.waitForSelector('input[name="hledat"]');
        await page.type('input[name="hledat"]', 'Catan', { delay: 100 });

        console.log('Pressing Enter...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.keyboard.press('Enter'),
        ]);

        console.log('Current URL:', page.url());

        // Screenshot
        await page.screenshot({ path: 'vesely_search_result.png' });
        console.log('Screenshot saved.');

        // Check for "Nenašli" or similar
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.includes('Nenašli') || bodyText.includes('Neboli nájdené') || bodyText.includes('0 výsledkov')) {
            console.log('Found "No results" message in body text.');
        } else {
            console.log('Did NOT find "No results" message.');
        }

        console.log('Waiting for .catalogue-item...');
        await page.waitForSelector('.catalogue-item', { timeout: 5000 });

        const items = await page.evaluate(() => {
            const elements = document.querySelectorAll('.catalogue-item');
            return Array.from(elements).slice(0, 3).map(el => ({
                name: el.querySelector('.product-name')?.textContent?.trim(),
            }));
        });
        console.log('Top items:', items);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

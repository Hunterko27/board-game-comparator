const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.vesely-drak.sk/vyhladavanie?string=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait additional time for JS to load
        console.log('Waiting 5 seconds for dynamic content...');
        await new Promise(r => setTimeout(r, 5000));

        //  Check DOM again
        const info = await page.evaluate(() => {
            // Look for ANY elements with hrefs containing product keywords
            const allLinks = Array.from(document.querySelectorAll('a[href*="/produkt"]'));

            return {
                totalLinks: document.querySelectorAll('a').length,
                productLinks: allLinks.length,
                sampleLinks: allLinks.slice(0, 3).map(a => ({
                    text: a.textContent?.trim().substring(0, 50),
                    href: a.href
                }))
            };
        });

        console.log('Info:', JSON.stringify(info, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

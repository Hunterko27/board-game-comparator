const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.funtastic.sk/', { waitUntil: 'networkidle2', timeout: 20000 });

        // Type into the search box with id="q"
        await page.type('#q', 'Catan');

        // Click the submit button
        await page.click('input[name="search_submit"]');

        // Wait for either navigation or AJAX
        await Promise.race([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => { }),
            new Promise(r => setTimeout(r, 10000))
        ]);

        const finalUrl = page.url();
        const bodyText = await page.evaluate(() => document.body.textContent);
        const catanCount = (bodyText.match(/catan/gi) || []).length;

        console.log(`URL after submit: ${finalUrl}`);
        console.log(`"Catan" mentions: ${catanCount}`);

        if (catanCount > 0) {
            // Extract product info
            const products = await page.evaluate(() => {
                const items = document.querySelectorAll('.product3, [class*="product"]');
                return Array.from(items).slice(0, 5).map((item, idx) => {
                    const link = item.querySelector('a');
                    return {
                        idx,
                        text: item.textContent.substring(0, 100).replace(/\s+/g, ' ').trim(),
                        href: link?.href || ''
                    };
                });
            });

            console.log('\nProducts found:');
            products.forEach(p => console.log(`${p.idx}. ${p.text}`));
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

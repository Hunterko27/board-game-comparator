const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to gorila.sk...');
        await page.goto('https://www.gorila.sk/', { waitUntil: 'networkidle2', timeout: 20000 });

        // Find search input
        const searchInputs = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"], input[name*="search"], input[placeholder*="hľad"], input[placeholder*="Hľad"]'));
            return inputs.map(inp => ({
                type: inp.type,
                name: inp.name,
                id: inp.id,
                placeholder: inp.placeholder,
                className: inp.className
            }));
        });

        console.log('Found search inputs:', JSON.stringify(searchInputs, null, 2));

        if (searchInputs.length > 0) {
            const input = searchInputs[0];
            let selector = '';
            if (input.id) selector = `#${input.id}`;
            else if (input.name) selector = `input[name="${input.name}"]`;
            else selector = 'input[type="text"]';

            console.log(`\nTyping into: ${selector}`);
            await page.type(selector, 'Catan');
            await page.keyboard.press('Enter');

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

            const url = page.url();
            const title = await page.title();

            console.log(`\nAfter search:`);
            console.log(`  URL: ${url}`);
            console.log(`  Title: ${title}`);

            // Look for products
            const productCount = await page.evaluate(() => {
                return document.querySelectorAll('[class*="product"], .product, article, [data-product]').length;
            });

            console.log(`  Products found: ${productCount}`);

            // Save HTML
            const html = await page.content();
            fs.writeFileSync('gorila_search_result.html', html);
            console.log('  Saved to gorila_search_result.html');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

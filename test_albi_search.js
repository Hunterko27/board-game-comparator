const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to homepage...');
        await page.goto('https://eshop.albi.sk/', { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a bit for any JS to load
        await new Promise(r => setTimeout(r, 2000));

        // Try to find search input - look for common patterns
        const searchInfo = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"], input[placeholder*="hľada"], input[placeholder*="Search"]'));
            return inputs.map(input => ({
                type: input.type,
                placeholder: input.placeholder,
                name: input.name,
                id: input.id,
                className: input.className
            }));
        });

        console.log('Found inputs:', JSON.stringify(searchInfo, null, 2));

        // Try to search using the first suitable input
        if (searchInfo.length > 0) {
            const firstInput = searchInfo[0];
            let selector = '';
            if (firstInput.id) {
                selector = `#${firstInput.id}`;
            } else if (firstInput.name) {
                selector = `input[name="${firstInput.name}"]`;
            } else if (firstInput.className) {
                selector = `.${firstInput.className.split(' ')[0]}`;
            }

            console.log(`Trying to type into: ${selector}`);
            await page.type(selector, 'Catan');
            await page.keyboard.press('Enter');

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

            console.log('After search, URL:', page.url());

            const pageInfo = await page.evaluate(() => ({
                title: document.title,
                productsCount: document.querySelectorAll('.rf-Product, [class*="product"]').length
            }));

            console.log('Page info:', pageInfo);

            // Save HTML for inspection
            const html = await page.content();
            fs.writeFileSync('albi_search_result.html', html);
            console.log('Saved HTML to albi_search_result.html');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

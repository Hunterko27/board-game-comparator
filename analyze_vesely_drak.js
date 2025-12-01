const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        await page.setJavaScriptEnabled(false);
        const url = 'https://www.vesely-drak.sk/hledat.php?hledat=Catan';
        console.log(`Navigating to ${url} with JS disabled`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Saving HTML...');
        const html = await page.content();
        fs.writeFileSync('vesely_drak_debug.html', html);

        // Check for products in the HTML content directly since evaluate won't work well without JS context (though puppeteer evaluate runs in its own context, page content is static)
        if (html.includes('Catan') || html.includes('product')) {
            console.log('Found potential products in HTML!');
        } else {
            console.log('No products found in HTML.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

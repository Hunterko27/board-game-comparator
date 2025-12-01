const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.funtastic.sk/hladaj?q=Catan';
        console.log(`Testing Funtastic: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
        await new Promise(r => setTimeout(r, 3000));

        // Get ALL divs with product3 class and extract names
        const allProducts = await page.evaluate(() => {
            const items = document.querySelectorAll('.product3');
            const results = [];

            items.forEach((item, idx) => {
                const linkEl = item.querySelector('a.product-box-link');
                const name = linkEl?.textContent?.trim() || 'NO NAME';
                const href = linkEl?.href || 'NO LINK';

                results.push({
                    index: idx,
                    name: name.substring(0, 100),
                    href: href.substring(0, 80)
                });
            });

            return results;
        });

        console.log(`\nFound ${allProducts.length} .product3 elements:`);
        allProducts.slice(0, 10).forEach(p => {
            console.log(`${p.index}. ${p.name}`);
        });

        // Check if any contain "Catan"
        const catanProducts = allProducts.filter(p => p.name.toLowerCase().includes('catan'));
        console.log(`\n${catanProducts.length} products contain "Catan":`);
        catanProducts.forEach(p => {
            console.log(`  - ${p.name}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

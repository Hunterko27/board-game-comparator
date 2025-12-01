const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.gorila.sk/vyhladavanie?q=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for AJAX to load products
        console.log('Waiting 7 seconds for AJAX products...');
        await new Promise(r => setTimeout(r, 7000));

        // Try to find products by checking DOM more carefully
        const analysis = await page.evaluate(() => {
            // Look for common patterns
            const allDivs = document.querySelectorAll('div[class*="product"], div[class*="item"], div[data-id]');
            const allArticles = document.querySelectorAll('article');
            const allLinks = Array.from(document.querySelectorAll('a[href*="/kniha/"], a[href*="/hra/"], a[href*="/produkt/"]'));

            // Get sample of what we found
            const sampleProduct = allLinks[0];
            let productHTML = '';
            if (sampleProduct) {
                // Get parent containers
                let current = sampleProduct;
                for (let i = 0; i < 5; i++) {
                    current = current.parentElement;
                    if (current && current.className) {
                        productHTML = current.outerHTML.substring(0, 800);
                        break;
                    }
                }
            }

            return {
                divsWithProduct: allDivs.length,
                articles: allArticles.length,
                productLinks: allLinks.length,
                sampleLink: allLinks[0]?.href || 'none',
                sampleProductHTML: productHTML,
                bodyClasses: document.body.className
            };
        });

        console.log('\nAnalysis:');
        console.log(JSON.stringify(analysis, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

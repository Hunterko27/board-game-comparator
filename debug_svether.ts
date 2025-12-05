import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Set User-Agent and extra headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        });

        const url = 'https://www.svet-her.cz/Vyhledavani?fraze=catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Check for products
        const products = await page.$$('.product-list .product');
        console.log(`Found ${products.length} products with selector .product-list .product`);

        if (products.length === 0) {
            console.log('No products found. Dumping HTML...');
            const html = await page.content();
            console.log(html.substring(0, 2000)); // Print first 2000 chars

            // Try to find any product-like elements
            const anyProducts = await page.$$('[class*="product"]');
            console.log(`Found ${anyProducts.length} elements with class containing "product"`);

            for (let i = 0; i < Math.min(anyProducts.length, 5); i++) {
                const cls = await page.evaluate(el => el.className, anyProducts[i]);
                console.log(`Element ${i} class: ${cls}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

run();

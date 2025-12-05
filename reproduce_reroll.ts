import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to homepage...');
        await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

        console.log('Typing "catan" into .search_input...');
        await page.type('.search_input', 'catan');

        console.log('Clicking "Hledat" button...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation timeout or no navigation')),
            page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('a, button, input[type="submit"]'));
                const searchBtn = buttons.find(b => b.textContent?.trim() === 'Hledat');
                if (searchBtn) {
                    (searchBtn as HTMLElement).click();
                } else {
                    console.log('Search button not found');
                }
            })
        ]);

        console.log('Current URL:', page.url());

        // Take a screenshot
        await page.screenshot({ path: 'reroll_search_result.png' });

        // Log some HTML to see if we have results
        const html = await page.content();
        console.log('HTML length:', html.length);

        // Check for product elements
        const products = await page.$$('.p_cart_block'); // Old selector
        console.log('Found .p_cart_block elements:', products.length);

        const anyProducts = await page.$$('.product_list li'); // Possible new selector based on curl output
        console.log('Found .product_list li elements:', anyProducts.length);

        if (anyProducts.length > 0) {
            const first = anyProducts[0];
            const text = await page.evaluate(el => el.textContent, first);
            console.log('First product text:', text?.substring(0, 100));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

run();

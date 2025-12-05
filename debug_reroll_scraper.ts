import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to homepage...');
        await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

        console.log('Typing "catan"...');
        await page.type('.search_input', 'catan');

        console.log('Clicking search...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
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

        console.log('URL after navigation:', page.url());

        // Try waiting for selector
        try {
            console.log('Waiting for .p_cart_block...');
            await page.waitForSelector('.p_cart_block', { timeout: 5000 });
            console.log('Selector found!');
        } catch (e) {
            console.log('Timeout waiting for selector');
        }

        const productElements = await page.$$('.p_cart_block');
        console.log(`Found ${productElements.length} elements.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

run();

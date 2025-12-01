import puppeteer from 'puppeteer';

async function analyze() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Try GET request with search_typ
    const searchUrl = 'https://www.reroll.cz/cs/search/?q=Catan&search_typ=0';

    console.log(`Navigating to ${searchUrl}...`);
    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        const title = await page.title();
        console.log('Page Title:', title);

        // Check if we have results
        const products = await page.$$('.p_cart_block');
        console.log('Product count:', products.length);

        if (products.length > 0) {
            console.log('GET request WORKS!');
        } else {
            console.log('GET request FAILED (no products found).');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

analyze();

// import { RerollScraper } from './lib/scrapers/reroll';
import puppeteer from 'puppeteer';
import fs from 'fs';

async function test() {
    const query = 'Marvel dice throne';
    console.log(`Searching for "${query}"...`);

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

        console.log('Setting value and submitting form...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.evaluate((q) => {
                const input = document.querySelector('input[name="q"]') as HTMLInputElement;
                if (input) input.value = q;
                const form = document.querySelector('form[name="search"]') as HTMLFormElement;
                if (form) form.submit();
            }, query)
        ]);

        const content = await page.content();
        fs.writeFileSync('reroll_debug.html', content);
        await page.screenshot({ path: 'reroll_debug.png' });

        // Check results
        const results = await page.$$('.p_cart_block');
        console.log(`Found ${results.length} results after explicit submit.`);

        if (results.length > 0) {
            const firstResult = await page.$eval('.p_title a span[itemprop="name"]', (el: Element) => el.textContent);
            console.log(`First result: ${firstResult}`);
        }

        await browser.close();

    } catch (error) {
        console.error('Error:', error);
    }
}

test();

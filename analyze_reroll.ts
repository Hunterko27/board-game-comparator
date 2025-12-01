import puppeteer from 'puppeteer';
import fs from 'fs';

async function analyze() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to homepage...');
        await page.goto('https://www.reroll.cz/', { waitUntil: 'networkidle2' });

        console.log('Typing query...');
        // Based on HTML: <input type="text" name="q" ... class="search_input">
        await page.type('.search_input', 'Catan');

        console.log('Submitting search via JS...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.evaluate(() => {
                const form = document.querySelector('form[name="search"]') as HTMLFormElement;
                if (form) form.submit();
            })
        ]);

        console.log('Current URL:', page.url());

        const content = await page.content();
        fs.writeFileSync('reroll_search_result.html', content);
        console.log('Saved HTML to reroll_search_result.html');

        await page.screenshot({ path: 'reroll_search_result.png' });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

analyze();

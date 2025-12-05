import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const url = 'https://www.funtastic.sk/search-engine.htm?slovo=catan&search_submit=&hledatjak=2';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const data = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a.product-box-link'));
            const logs: string[] = [];

            for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
                const link = allLinks[i];
                const name = link.textContent?.trim();
                if (name && name.includes('Catan: Junior')) {
                    logs.push(`\nLink: "${name}"`);
                    // Find the closest common ancestor that contains the price
                    let parent = link.parentElement;
                    while (parent && parent.textContent && !parent.textContent.includes('26,95')) {
                        parent = parent.parentElement;
                    }
                    if (parent) {
                        logs.push(`Found price container: <${parent.tagName.toLowerCase()} class="${parent.className}">`);
                        logs.push(`Inner HTML: ${parent.innerHTML}`);
                    } else {
                        logs.push('Could not find container with price "26,95"');
                    }
                }
            }
            return logs;
        });

        console.log(data.join('\n'));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

run();

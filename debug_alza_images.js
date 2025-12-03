const puppeteer = require('puppeteer');

async function debug() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const query = 'Catan';
    const url = `https://www.alza.sk/search.htm?exps=${encodeURIComponent(query)}`;

    try {
        console.log(`Navigating to ${url}`);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Scroll a bit
        await page.evaluate(() => window.scrollBy(0, 500));
        await new Promise(r => setTimeout(r, 2000));

        const images = await page.evaluate(() => {
            const items = document.querySelectorAll('.box, .browsing-item');
            return Array.from(items).map(item => {
                const img = item.querySelector('img');
                return {
                    src: img ? img.src : 'NO IMG',
                    dataSrc: img ? img.getAttribute('data-src') : 'NO DATA-SRC',
                    datasetSrc: img ? img.dataset.src : 'NO DATASET.SRC',
                    srcset: img ? img.getAttribute('srcset') : 'NO SRCSET',
                    outerHTML: img ? img.outerHTML : 'NO IMG ELEMENT'
                };
            });
        });

        console.log('Found images:', JSON.stringify(images, null, 2));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

debug();

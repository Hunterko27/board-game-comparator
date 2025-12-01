const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const url = 'https://www.funtastic.sk/search-engine.htm?slovo=Catan&search_submit=&hledatjak=2';
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 3000));

        // Save full HTML
        const html = await page.content();
        fs.writeFileSync('funtastic_search_working.html', html);

        // Find elements containing "Catan"
        const catanProducts = await page.evaluate(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const catanEls = [];

            allElements.forEach(el => {
                const text = el.textContent || '';
                if (text.toLowerCase().includes('catan') && text.length < 300 && text.length > 10) {
                    // Check if it's likely a product (has link or specific class)
                    const hasLink = el.querySelector('a[href]');
                    const className = el.className;

                    if (hasLink || className.includes('product')) {
                        catanEls.push({
                            tag: el.tagName,
                            className: className,
                            text: text.substring(0, 150).trim(),
                            html: el.outerHTML.substring(0, 500)
                        });
                    }
                }
            });

            return catanEls.slice(0, 5);
        });

        console.log('Elements containing "Catan":');
        catanProducts.forEach((el, i) => {
            console.log(`\n${i + 1}. <${el.tag} class="${el.className}">`);
            console.log(`Text: ${el.text}`);
            console.log(`HTML preview: ${el.html.substring(0, 200)}...`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

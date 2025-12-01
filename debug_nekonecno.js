const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // First, go to homepage to find search or just try a likely search URL
        // Let's try a direct search URL first, it's usually faster if it works
        // Common patterns: /vyhladavanie?q=, /search?q=, /?s=
        // But to be safe and robust, let's try to navigate from homepage if we can, 
        // or just try a known pattern if I can search for it.
        // Since I don't have internet search, I will try to visit the homepage and find the search box.

        console.log('Navigating to homepage...');
        await page.goto('https://www.nekonecno.sk/', { waitUntil: 'networkidle2' });

        // Try to find search input
        const searchInput = await page.$('input[name="string"]'); // "string" is common in Shoptet, let's see
        // Or name="s", name="q", name="search"

        if (searchInput) {
            console.log('Found search input with name="string"');
        } else {
            console.log('Search input not found immediately, dumping page content to check form');
            // We might need to inspect the page content to find the search form
        }

        // Actually, let's just try a common URL pattern for Shoptet (many SK shops use it)
        // https://www.nekonecno.sk/vyhladavanie/?string=catan
        const searchUrl = 'https://www.nekonecno.sk/vyhladavanie/?string=catan';
        console.log(`Trying direct search URL: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        const content = await page.content();
        fs.writeFileSync('nekonecno_debug.html', content);
        console.log('Saved HTML to nekonecno_debug.html');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();

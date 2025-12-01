const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Try the search URL directly
    const searchUrl = 'https://eshop.albi.sk/vyhladavanie/?q=Catan';
    console.log(`Navigating to ${searchUrl}...`);

    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a bit for any dynamic content
        await new Promise(r => setTimeout(r, 3000));

        const content = await page.content();
        fs.writeFileSync('albi_search_dump.html', content);
        console.log('HTML dumped to albi_search_dump.html');

        // Try to log some basic info to see if we got results
        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}`);

    } catch (error) {
        console.error('Error:', error.message);
    }

    await browser.close();
})();

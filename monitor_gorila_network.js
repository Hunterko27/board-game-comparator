const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const requests = [];

    // Listen to all network requests
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('api') || url.includes('json') || url.includes('search') || url.includes('product')) {
            try {
                const contentType = response.headers()['content-type'];
                if (contentType && contentType.includes('json')) {
                    const data = await response.json();
                    requests.push({
                        url,
                        status: response.status(),
                        dataKeys: Object.keys(data).slice(0, 10)
                    });
                }
            } catch (e) {
                // ignore
            }
        }
    });

    try {
        const url = 'https://www.gorila.sk/vyhladavanie?q=Catan';
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        await new Promise(r => setTimeout(r, 5000));

        console.log('\nAPI/JSON requests found:');
        requests.forEach((req, i) => {
            console.log(`\n${i + 1}. ${req.url}`);
            console.log(`   Status: ${req.status}`);
            console.log(`   Data keys: ${JSON.stringify(req.dataKeys)}`);
        });

        if (requests.length === 0) {
            console.log('No API requests detected - site may use different loading mechanism');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
})();

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const sites = [
        {
            name: 'Gorila.sk', urls: [
                'https://www.gorila.sk/',
                'https://www.gorila.sk/hladaj?q=Catan',
                'https://www.gorila.sk/search?q=Catan'
            ]
        },
        {
            name: 'Xzone.sk', urls: [
                'https://www.xzone.sk/',
                'https://www.xzone.sk/hladaj?q=Catan',
                'https://www.xzone.sk/search?q=Catan'
            ]
        },
        {
            name: 'Alza.sk', urls: [
                'https://www.alza.sk/hladaj?exps=catan',
                'https://www.alza.sk/search?q=catan'
            ]
        }
    ];

    for (const site of sites) {
        console.log(`\n=== ${site.name} ===`);
        for (const url of site.urls) {
            try {
                console.log(`Testing: ${url}`);
                const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
                console.log(`  Status: ${response.status()}`);

                if (response.status() === 200) {
                    const title = await page.title();
                    console.log(`  Title: ${title}`);
                    console.log(`  ✓ This URL works!`);
                    break;
                }
            } catch (e) {
                console.log(`  ✗ ${e.message}`);
            }
        }
    }

    await browser.close();
})();

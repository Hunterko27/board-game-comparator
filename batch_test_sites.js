const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const sites = [
        { name: 'Dracik.sk', searchUrls: ['https://www.dracik.sk/hladaj?q=Catan', 'https://www.dracik.sk/search?q=Catan'] },
        { name: 'Funtastic.sk', searchUrls: ['https://www.funtastic.sk/hladaj?q=Catan', 'https://www.funtastic.sk/search?q=Catan'] },
        { name: 'Imago.sk', searchUrls: ['https://www.imago.sk/vyhladavanie?q=Catan', 'https://www.imago.sk/search?q=Catan'] },
        { name: 'Hrackyshop.sk', searchUrls: ['https://www.hrackyshop.sk/hladaj?q=Catan', 'https://www.hrackyshop.sk/search?q=Catan'] },
        { name: 'Nekonecno.sk', searchUrls: ['https://www.nekonecno.sk/hladaj?q=Catan', 'https://www.nekonecno.sk/search?q=Catan'] },
        { name: 'Megaknihy.sk', searchUrls: ['https://www.megaknihy.sk/vyhladavanie?q=Catan', 'https://www.megaknihy.sk/search?q=Catan'] },
    ];

    const results = [];

    for (const site of sites) {
        console.log(`\n=== Testing ${site.name} ===`);
        let found = false;

        for (const url of site.searchUrls) {
            if (found) break;

            try {
                console.log(`  Trying: ${url}`);
                const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

                if (response.status() === 200) {
                    await new Promise(r => setTimeout(r, 3000));

                    const info = await page.evaluate(() => ({
                        title: document.title,
                        hasProducts: document.querySelectorAll('[class*="product"], .product, article').length,
                        bodyText: document.body.textContent.substring(0, 200)
                    }));

                    console.log(`  ✓ Status 200`);
                    console.log(`  Title: ${info.title}`);
                    console.log(`  Products: ${info.hasProducts}`);

                    if (info.hasProducts > 0) {
                        results.push({ site: site.name, url, status: 'WORKS', products: info.hasProducts });
                        found = true;
                    } else {
                        results.push({ site: site.name, url, status: 'NO_PRODUCTS', products: 0 });
                    }
                }
            } catch (e) {
                console.log(`  ✗ ${e.message}`);
                results.push({ site: site.name, url, status: 'ERROR', error: e.message.substring(0, 50) });
            }
        }

        if (!found) {
            console.log(`  → ${site.name} - need manual homepage test`);
        }
    }

    console.log('\n\n=== SUMMARY ===');
    results.filter(r => r.status === 'WORKS').forEach(r => {
        console.log(`✓ ${r.site}: ${r.url} (${r.products} products)`);
    });

    console.log('\n=== NEED MORE WORK ===');
    results.filter(r => r.status !== 'WORKS').forEach(r => {
        console.log(`? ${r.site}: ${r.status}`);
    });

    await browser.close();
})();

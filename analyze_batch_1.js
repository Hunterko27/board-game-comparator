const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function analyze() {
    const shops = [
        { name: 'bohemiangames', url: 'https://www.bohemiangames.cz/vyhledavani/?string=karak' }, // Guessing URL
        { name: 'olddawg', url: 'https://www.old-dawg.cz/vyhledavani/?string=karak' }, // Guessing URL
        { name: 'hras', url: 'https://www.hras.cz/vyhledavani/?string=karak' } // Guessing URL
    ];

    for (const shop of shops) {
        try {
            console.log(`Fetching ${shop.name}...`);
            const html = await fetchUrl(shop.url);
            fs.writeFileSync(`${shop.name}_search.html`, html);
            console.log(`Saved ${shop.name}_search.html`);
        } catch (e) {
            console.error(`Error fetching ${shop.name}:`, e.message);
        }
    }
}

analyze();

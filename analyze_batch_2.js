const https = require('https');
const fs = require('fs');

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'cs,en-US;q=0.7,en;q=0.3'
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Handle redirect
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function analyze() {
    const shops = [
        { name: 'bohemiangames_cat', url: 'https://www.bohemiangames.cz/deskove-a-karetni-hry/' },
        { name: 'olddawg_cat', url: 'https://www.old-dawg.cz/vydane-hry/' },
        { name: 'imago_cz', url: 'https://www.imago.cz/vyhledavani?q=karak' },
        { name: 'nadesce', url: 'https://www.nadesce.cz/vyhledavani/?string=karak' },
        { name: 'hrydoruky', url: 'https://www.hrydoruky.cz/vyhledavani/?string=karak' }
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

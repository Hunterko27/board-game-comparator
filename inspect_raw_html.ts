import * as cheerio from 'cheerio';
import fs from 'fs';

const targets = [
    { name: 'Planeta Her', url: 'https://www.planetaher.cz/vyhledavani?s=catan' },
    { name: 'Albi', url: 'https://eshop.albi.sk/vyhladavanie/?q=catan' }
];

async function run() {
    for (const target of targets) {
        try {
            console.log(`Fetching ${target.name}...`);
            const response = await fetch(target.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                }
            });
            const html = await response.text();
            console.log(`${target.name} status: ${response.status}`);
            console.log(`${target.name} length: ${html.length}`);

            // Save to file for inspection
            fs.writeFileSync(`${target.name.replace(' ', '_')}_raw.html`, html);

            const $ = cheerio.load(html);
            // Log some potential containers
            if (target.name === 'Planeta Her') {
                console.log('Planeta Her .lb-result:', $('.lb-result').length);
                console.log('Planeta Her .product:', $('.product').length);
                console.log('Planeta Her body content preview:', $('body').text().substring(0, 200));
            } else {
                console.log('Albi .product-item:', $('.product-item').length);
                console.log('Albi .product:', $('.product').length);
                console.log('Albi body content preview:', $('body').text().substring(0, 200));
            }

        } catch (error) {
            console.error(`Error fetching ${target.name}:`, error);
        }
    }
}

run();

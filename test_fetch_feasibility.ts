import * as cheerio from 'cheerio';

const targets = [
    { name: 'Albi', url: 'https://eshop.albi.sk/vyhladavanie/?q=catan' },
    { name: 'Planeta Her', url: 'https://www.planetaher.cz/vyhledavani?s=catan' },
    { name: 'Funtastic', url: 'https://www.funtastic.sk/search-engine.htm?slovo=catan&search_submit=&hledatjak=2' },
    { name: 'Nekonecno', url: 'https://www.nekonecno.sk/vyhladavanie/?string=catan' },
    { name: 'Megaknihy', url: 'https://www.megaknihy.sk/vyhladavanie?q=catan' },
    { name: 'Reroll', url: 'https://www.reroll.cz/cs/search/catan/' }
];

async function run() {
    console.log('Testing Fetch Feasibility...');

    for (const target of targets) {
        try {
            console.log(`\n--- Testing ${target.name} ---`);
            const start = Date.now();
            const response = await fetch(target.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
                }
            });
            const html = await response.text();
            const duration = Date.now() - start;
            const $ = cheerio.load(html);

            // Basic checks for product elements
            let count = 0;
            if (target.name === 'Albi') count = $('.product-item, .product').length;
            else if (target.name === 'Planeta Her') count = $('.lb-result').length;
            else if (target.name === 'Funtastic') count = $('.productBody').length;
            else if (target.name === 'Nekonecno') count = $('.product.lb-product').length;
            else if (target.name === 'Megaknihy') count = $('li.ajax_block_product').length;
            else if (target.name === 'Reroll') count = $('.p_cart_block').length;

            console.log(`Status: ${response.status}`);
            console.log(`Duration: ${duration}ms`);
            console.log(`Found Items: ${count}`);

            if (count > 0) {
                console.log('VERDICT: FEASIBLE ✅');
            } else {
                console.log('VERDICT: NOT FEASIBLE ❌ (or blocked/dynamic)');
            }

        } catch (error) {
            console.error(`Error fetching ${target.name}:`, error);
        }
    }
}

run();

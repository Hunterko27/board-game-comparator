const fs = require('fs');

const shops = [
    { name: 'deskoland', url: 'https://www.deskoland.cz/vyhledavani/?string=karak' },
    { name: 'odhry', url: 'https://www.odhry.cz/vyhledavani/?string=karak' },
    { name: 'cechhracu', url: 'https://www.cechhracu.cz/vyhledavani/?string=karak' },
    { name: 'mysidoupe', url: 'https://www.mysidoupe.cz/vyhledavani/?string=karak' },
    { name: 'tabletop', url: 'https://www.tabletop.cz/vyhledavani/?string=karak' }
];

async function fetchAndSave() {
    for (const shop of shops) {
        try {
            console.log(`Fetching ${shop.name}...`);
            const response = await fetch(shop.url);
            const text = await response.text();
            fs.writeFileSync(`${shop.name}_search.html`, text);
            console.log(`Saved ${shop.name}_search.html`);
        } catch (error) {
            console.error(`Error fetching ${shop.name}:`, error);
        }
    }
}

fetchAndSave();

const fs = require('fs');

async function analyze() {
    const url = 'https://www.hrydoruky.cz/search?q=karak';
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url);
        const html = await response.text();
        fs.writeFileSync('hrydoruky_search.html', html);
        console.log('Saved hrydoruky_search.html');
    } catch (e) {
        console.error('Error fetching hrydoruky:', e.message);
    }
}

analyze();

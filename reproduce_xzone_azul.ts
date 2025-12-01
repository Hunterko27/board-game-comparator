import { XzoneScraper } from './lib/scrapers/xzone';

async function run() {
    const query = 'azul';
    console.log('--- Testing Xzone Scraper ---');
    const xzone = new XzoneScraper();
    const results = await xzone.search(query);
    console.log(`Xzone found ${results.length} results.`);

    const azula = results.filter(r => r.name.toLowerCase().includes('azula'));
    if (azula.length > 0) {
        console.log('FAIL: Found "Azula" results:');
        azula.forEach(r => console.log(`- ${r.name}`));
    } else {
        console.log('PASS: No "Azula" results found.');
    }

    console.log('\nAll results:');
    results.forEach(r => console.log(`- ${r.name}`));
}

run();

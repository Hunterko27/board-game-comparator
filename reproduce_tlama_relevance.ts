import { TlamaGamesScraper } from './lib/scrapers/tlamagames';

async function run() {
    console.log('--- Testing Tlama Games Scraper Relevance ---');
    const tlama = new TlamaGamesScraper();
    const results = await tlama.search('catan junior');
    console.log(`Found ${results.length} results.`);

    const irrelevant = results.filter(r => !r.name.toLowerCase().includes('catan') || !r.name.toLowerCase().includes('junior'));

    if (irrelevant.length > 0) {
        console.log('FAIL: Found irrelevant results:');
        irrelevant.forEach(r => console.log(`- ${r.name}`));
    } else {
        console.log('PASS: All results appear relevant.');
    }

    console.log('\nAll results:');
    results.forEach(r => console.log(`- ${r.name}`));
}

run();

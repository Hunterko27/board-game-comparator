import { NekonecnoScraper } from './lib/scrapers/nekonecno';

async function run() {
    const scraper = new NekonecnoScraper();
    console.log('Testing NekonecnoScraper...');
    const start = Date.now();
    const results = await scraper.search('catan');
    const duration = Date.now() - start;
    console.log(`Finished in ${duration}ms`);
    console.log(`Found ${results.length} results`);
    if (results.length > 0) {
        console.log('Sample:', results[0]);
    }
}

run();

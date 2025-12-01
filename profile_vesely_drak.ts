import { VeselyDrakScraper } from './lib/scrapers/vesely_drak';

async function profile() {
    console.log('Profiling VeselyDrakScraper...');
    const scraper = new VeselyDrakScraper();
    const start = Date.now();

    try {
        console.log('Starting search...');
        const results = await scraper.search('Catan');
        const end = Date.now();
        console.log(`Total time: ${(end - start) / 1000}s`);
        console.log(`Found ${results.length} results.`);
    } catch (e) {
        console.error('ERROR:', e);
    }
}

profile();

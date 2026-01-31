
import { AlbiCZScraper } from './lib/scrapers/albi_cz';

async function run() {
    const scraper = new AlbiCZScraper();
    console.log('Running AlbiCZScraper for query "Voidfall"...');
    try {
        const results = await scraper.search('Voidfall');
        console.log(`Found ${results.length} results:`);
        results.forEach(r => console.log(`- ${r.name} (${r.price} ${r.currency}) [${r.availability}]`));
    } catch (error) {
        console.error('Error running scraper:', error);
    }
}

run();

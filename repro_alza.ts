
import { AlzaScraper } from './lib/scrapers/alza';

async function run() {
    const scraper = new AlzaScraper();
    console.log('Running AlzaScraper for query "Voidfall"...');
    try {
        const results = await scraper.search('Voidfall');
        console.log(`Found ${results.length} results:`);
        results.forEach(r => console.log(`- ${r.name} (${r.price} ${r.currency}) [${r.availability}]`));
    } catch (error) {
        console.error('Error running scraper:', error);
    }
}

run();

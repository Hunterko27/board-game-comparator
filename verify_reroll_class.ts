import { RerollScraper } from './lib/scrapers/reroll';

async function main() {
    const scraper = new RerollScraper();
    console.log('Testing RerollScraper...');
    try {
        const results = await scraper.search('Marvel dice throne');
        console.log(`Found ${results.length} results.`);
        results.forEach(r => console.log(`- ${r.name} (${r.price} ${r.currency})`));
    } catch (error) {
        console.error('Error:', error);
    }
}

main();

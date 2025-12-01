import { RerollScraper } from './lib/scrapers/reroll';

async function test() {
    const scraper = new RerollScraper();
    const query = 'Marvel dice throne';
    console.log(`Searching for "${query}" using app environment...`);

    try {
        const results = await scraper.search(query);
        console.log(`Found ${results.length} results.`);
        results.forEach(r => {
            console.log(`- Name: "${r.name}"`);
            console.log(`  Price: ${r.price}`);
            console.log(`  Availability: ${r.availability}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

test();

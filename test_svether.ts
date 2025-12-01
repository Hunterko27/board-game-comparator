import { SvetHerScraper } from './lib/scrapers/svether';

(async () => {
    const scraper = new SvetHerScraper();
    console.log('Testing SvetHerScraper...');
    try {
        const results = await scraper.search('Catan');
        console.log(`Found ${results.length} results:`);
        results.forEach(r => {
            console.log(`- ${r.name} (${r.price} ${r.currency}) - ${r.availability}`);
            console.log(`  Link: ${r.link}`);
            console.log(`  Image: ${r.imageUrl}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
})();

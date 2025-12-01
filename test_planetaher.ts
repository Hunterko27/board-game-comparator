import { PlanetaHerScraper } from './lib/scrapers/planetaher';

(async () => {
    const scraper = new PlanetaHerScraper();
    console.log('Testing PlanetaHerScraper...');
    const results = await scraper.search('Catan');
    console.log(`Found ${results.length} results:`);
    results.forEach(r => {
        console.log(`- ${r.name} (${r.price} ${r.currency}) - ${r.availability}`);
        console.log(`  Link: ${r.link}`);
        console.log(`  Image: ${r.imageUrl}`);
    });
})();

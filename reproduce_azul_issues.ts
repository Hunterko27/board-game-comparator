import { MegaknihyScraper } from './lib/scrapers/megaknihy';
import { GorilaScraper } from './lib/scrapers/gorila';

async function run() {
    const query = 'azul';

    console.log('--- Testing Megaknihy Scraper ---');
    const megaknihy = new MegaknihyScraper();
    const megaknihyResults = await megaknihy.search(query);
    console.log(`Megaknihy found ${megaknihyResults.length} results.`);
    megaknihyResults.forEach(r => console.log(`- ${r.name} (${r.price} ${r.currency})`));

    console.log('\n--- Testing Gorila Scraper ---');
    const gorila = new GorilaScraper();
    const gorilaResults = await gorila.search(query);
    console.log(`Gorila found ${gorilaResults.length} results.`);
    gorilaResults.forEach(r => console.log(`- ${r.name} (${r.price} ${r.currency})`));
}

run();

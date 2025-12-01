import { AlbiScraper } from './lib/scrapers/albi';
import { FuntasticScraper } from './lib/scrapers/funtastic';
import { HrackyshopScraper } from './lib/scrapers/hrackyshop';
import { IhryskoScraper } from './lib/scrapers/ihrysko';
import { LudopolisScraper } from './lib/scrapers/ludopolis';
import { MegaknihyScraper } from './lib/scrapers/megaknihy';
import { VeselyDrakScraper } from './lib/scrapers/vesely_drak';
import { SvetDeskovychHerScraper } from './lib/scrapers/svet_deskovych_her';
import { SvetHerScraper } from './lib/scrapers/svether';
import { PlanetaHerScraper } from './lib/scrapers/planetaher';

import { AlbiCZScraper } from './lib/scrapers/albi_cz';

async function verifyScrapers() {
    const scrapers = [
        new AlbiScraper(),
        new AlbiCZScraper(),
        new FuntasticScraper(),
        new HrackyshopScraper(),
        new IhryskoScraper(),
        new LudopolisScraper(),
        new MegaknihyScraper(),
        new VeselyDrakScraper(),
        new SvetDeskovychHerScraper(),
        new SvetHerScraper(),
        new PlanetaHerScraper()
    ];

    const query = 'catan';
    console.log(`Verifying scrapers with query: "${query}"`);

    for (const scraper of scrapers) {
        console.log(`\n--- Testing ${scraper.name} ---`);
        try {
            const results = await scraper.search(query);
            console.log(`Found ${results.length} results.`);
            if (results.length > 0) {
                console.log('Sample result:', results[0]);
            } else {
                console.warn(`WARNING: No results found for ${scraper.name}`);
            }
        } catch (error) {
            console.error(`ERROR testing ${scraper.name}:`, error);
        }
    }
}

verifyScrapers();

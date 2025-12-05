import { AlzaScraper } from './lib/scrapers/alza';
import { AlbiScraper } from './lib/scrapers/albi';
import { MegaknihyScraper } from './lib/scrapers/megaknihy';
import { PlanetaHerScraper } from './lib/scrapers/planetaher';
import { SvetHerScraper } from './lib/scrapers/svether';
import { FuntasticScraper } from './lib/scrapers/funtastic';
import { NekonecnoScraper } from './lib/scrapers/nekonecno';
import { RerollScraper } from './lib/scrapers/reroll';
import { ImagoCZScraper } from './lib/scrapers/imago_cz';
import { VeselyDrakScraper } from './lib/scrapers/vesely_drak';

const scrapers = [
    new AlzaScraper(),
    new AlbiScraper(),
    new MegaknihyScraper(),
    new PlanetaHerScraper(),
    new SvetHerScraper(),
    new FuntasticScraper(),
    new NekonecnoScraper(),
    new RerollScraper(),
    new ImagoCZScraper(),
    new VeselyDrakScraper()
];

async function testScrapers() {
    const query = 'catan';
    console.log(`Testing missing scrapers with query: "${query}"`);

    for (const scraper of scrapers) {
        console.log(`\n--- Testing ${scraper.name} ---`);
        const start = Date.now();
        try {
            const results = await scraper.search(query);
            const duration = Date.now() - start;
            console.log(`[${scraper.name}] Finished in ${duration}ms. Found ${results.length} results.`);
            if (results.length > 0) {
                console.log(`Sample result: ${results[0].name} - ${results[0].price} ${results[0].currency}`);
            }
        } catch (error) {
            const duration = Date.now() - start;
            console.error(`[${scraper.name}] Failed after ${duration}ms:`, error);
        }
    }
}

testScrapers();

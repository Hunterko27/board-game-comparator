import { IhryskoScraper } from './lib/scrapers/ihrysko';
import { LudopolisScraper } from './lib/scrapers/ludopolis';
import { FuntasticScraper } from './lib/scrapers/funtastic';
import { MegaknihyScraper } from './lib/scrapers/megaknihy';
import { AlbiScraper } from './lib/scrapers/albi';
import { HrackyshopScraper } from './lib/scrapers/hrackyshop';
import { VeselyDrakScraper } from './lib/scrapers/vesely_drak';
import { DracikScraper } from './lib/scrapers/dracik';
import { ImagoScraper } from './lib/scrapers/imago';
import { NekonecnoScraper } from './lib/scrapers/nekonecno';
import { GorilaScraper } from './lib/scrapers/gorila';
import { XzoneScraper } from './lib/scrapers/xzone';
import { AlzaScraper } from './lib/scrapers/alza';
import { Scraper } from './lib/scrapers/types';

async function testScraper(scraper: Scraper, query: string) {
    console.log(`Testing ${scraper.name}...`);
    try {
        const start = Date.now();
        const results = await scraper.search(query);
        const duration = Date.now() - start;
        console.log(`  Found ${results.length} results in ${duration}ms`);
        if (results.length > 0) {
            console.log(`  First result: ${results[0].name} - ${results[0].price} EUR`);
        } else {
            console.warn(`  WARNING: No results found for ${scraper.name}`);
        }
        return results.length > 0;
    } catch (error) {
        console.error(`  ERROR in ${scraper.name}:`, error);
        return false;
    }
}

async function runAllTests() {
    const scrapers = [
        new IhryskoScraper(),
        new LudopolisScraper(),
        new FuntasticScraper(),
        new MegaknihyScraper(),
        new AlbiScraper(),
        new HrackyshopScraper(),
        new VeselyDrakScraper(),
        new DracikScraper(),
        new ImagoScraper(),
        new NekonecnoScraper(),
        new GorilaScraper(),
        new XzoneScraper(),
        new AlzaScraper(),
    ];

    const query = 'Catan';
    console.log(`Running FULL SUITE tests with query: "${query}"`);

    let successCount = 0;
    for (const scraper of scrapers) {
        const success = await testScraper(scraper, query);
        if (success) successCount++;
    }

    console.log('---------------------------------------------------');
    console.log(`Summary: ${successCount}/${scrapers.length} scrapers passed.`);
}

runAllTests();

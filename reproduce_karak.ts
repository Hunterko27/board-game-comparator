import { XzoneScraper } from './lib/scrapers/xzone';
import { ImagoScraper } from './lib/scrapers/imago';
import { HrackyshopScraper } from './lib/scrapers/hrackyshop';
import { DracikScraper } from './lib/scrapers/dracik';
import { AlzaScraper } from './lib/scrapers/alza';
import { Scraper } from './lib/scrapers/types';

async function testScraper(scraper: Scraper, query: string) {
    console.log(`\n--- Testing ${scraper.name} ---`);
    try {
        const results = await scraper.search(query);
        console.log(`Found ${results.length} results:`);
        results.forEach(r => {
            console.log(`- ${r.name} (${r.price} EUR)`);
            console.log(`  Link: ${r.link}`);
        });
    } catch (error) {
        console.error(`ERROR in ${scraper.name}:`, error);
    }
}

async function run() {
    const query = 'Karak';
    const scrapers = [
        new XzoneScraper(),
        new ImagoScraper(),
        new HrackyshopScraper(),
        new DracikScraper(),
        new AlzaScraper()
    ];

    for (const scraper of scrapers) {
        await testScraper(scraper, query);
    }
}

run();

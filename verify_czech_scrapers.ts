import { BohemianGamesScraper } from './lib/scrapers/bohemiangames';
import { OldDawgScraper } from './lib/scrapers/olddawg';
import { HrasScraper } from './lib/scrapers/hras';
import { NadesceScraper } from './lib/scrapers/nadesce';
import { HryDoRukyScraper } from './lib/scrapers/hrydoruky';
import { ImagoCZScraper } from './lib/scrapers/imago_cz';

async function verify() {
    const scrapers = [
        new BohemianGamesScraper(),
        new OldDawgScraper(),
        new HrasScraper(),
        new NadesceScraper(),
        new HryDoRukyScraper(),
        new ImagoCZScraper(),
    ];

    const query = 'karak';

    for (const scraper of scrapers) {
        console.log(`Testing ${scraper.name}...`);
        try {
            const results = await scraper.search(query);
            console.log(`Found ${results.length} results for ${scraper.name}`);
            if (results.length > 0) {
                console.log('First result:', results[0]);
            } else {
                console.log('No results found.');
            }
        } catch (e) {
            console.error(`Error testing ${scraper.name}:`, e);
        }
        console.log('---');
    }
}

verify();

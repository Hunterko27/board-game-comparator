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
            console.log(`  Link: ${results[0].link}`);
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
        new GorilaScraper(),
        new XzoneScraper(),
        new AlzaScraper()
    ];

    const query = 'Catan';
    console.log(`Running tests for new scrapers with query: "${query}"`);

    let successCount = 0;
    for (const scraper of scrapers) {
        const success = await testScraper(scraper, query);
        if (success) successCount++;
    }

    console.log('---------------------------------------------------');
    console.log(`Summary: ${successCount}/${scrapers.length} scrapers passed.`);

    if (successCount === scrapers.length) {
        console.log('ALL TESTS PASSED');
    } else {
        console.error('SOME TESTS FAILED');
        process.exit(1);
    }
}

runAllTests();

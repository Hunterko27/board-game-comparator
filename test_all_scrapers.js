const { IhryskoScraper } = require('./lib/scrapers/ihrysko.ts');
const { LudopolisScraper } = require('./lib/scrapers/ludopolis.ts');
const { FuntasticScraper } = require('./lib/scrapers/funtastic.ts');
const { MegaknihyScraper } = require('./lib/scrapers/megaknihy.ts');
const { AlbiScraper } = require('./lib/scrapers/albi.ts');
const { HrackyshopScraper } = require('./lib/scrapers/hrackyshop.ts');

(async () => {
    const scrapers = [
        new IhryskoScraper(),
        new LudopolisScraper(),
        new FuntasticScraper(),
        new MegaknihyScraper(),
        new AlbiScraper(),
        new HrackyshopScraper()
    ];

    for (const scraper of scrapers) {
        console.log(`\n=== Testing ${scraper.name} ===`);
        try {
            const results = await scraper.search('Catan');
            console.log(`✓ Found ${results.length} products`);

            if (results.length > 0) {
                console.log('Top 3 results:');
                results.slice(0, 3).forEach((p, i) => {
                    console.log(`${i + 1}. ${p.name} - €${p.price} (${p.availability})`);
                    console.log(`   Link: ${p.link}`);
                });
            } else {
                console.log('No results found.');
            }
        } catch (error) {
            console.error(`Error testing ${scraper.name}:`, error);
        }
    }
})();

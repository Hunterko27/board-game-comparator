const { LudopolisScraper } = require('./lib/scrapers/ludopolis.ts');

(async () => {
    console.log('Testing Ludopolis scraper...');
    const scraper = new LudopolisScraper();
    const results = await scraper.search('osadnici');

    console.log(`\nFound ${results.length} products:`);
    results.slice(0, 3).forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name}`);
        console.log(`   Price: ${product.price} ${product.currency}`);
        console.log(`   Availability: ${product.availability}`);
        console.log(`   Shop: ${product.shopName}`);
    });
})();

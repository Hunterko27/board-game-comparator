const { FuntasticScraper } = require('./lib/scrapers/funtastic.ts');

(async () => {
    console.log('Testing FuntasticScraper...');
    const scraper = new FuntasticScraper();
    const results = await scraper.search('Catan');

    console.log(`\nFound ${results.length} products:`);
    results.slice(0, 3).forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name}`);
        console.log(`   Price: ${product.price} ${product.currency}`);
        console.log(`   Shop: ${product.shopName}`);
    });
})();

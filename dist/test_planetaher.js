"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const planetaher_1 = require("./lib/scrapers/planetaher");
(async () => {
    const scraper = new planetaher_1.PlanetaHerScraper();
    console.log('Testing PlanetaHerScraper...');
    const results = await scraper.search('Catan');
    console.log(`Found ${results.length} results:`);
    results.forEach(r => {
        console.log(`- ${r.name} (${r.price} ${r.currency}) - ${r.availability}`);
        console.log(`  Link: ${r.link}`);
        console.log(`  Image: ${r.imageUrl}`);
    });
})();

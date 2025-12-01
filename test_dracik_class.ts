import { DracikScraper } from './lib/scrapers/dracik';

(async () => {
    const scraper = new DracikScraper();
    console.log(`Testing scraper: ${scraper.name}`);

    try {
        const results = await scraper.search('Catan');
        console.log(`Found ${results.length} results:`);
        results.forEach(r => {
            console.log(`- ${r.name} (${r.price} ${r.currency})`);
            console.log(`  Link: ${r.link}`);
            console.log(`  Image: ${r.imageUrl}`);
            console.log(`  Availability: ${r.availability}`);
        });

        if (results.length > 0) {
            const first = results[0];
            if (!first.name || !first.price || !first.link || !first.imageUrl) {
                console.error('Validation FAILED: Missing required fields in first result');
                process.exit(1);
            }
            if (!first.link.startsWith('http')) {
                console.error('Validation FAILED: Link is not an absolute URL');
                process.exit(1);
            }
            if (!first.imageUrl.startsWith('http')) {
                console.error('Validation FAILED: Image URL is not an absolute URL');
                process.exit(1);
            }
            console.log('Validation PASSED');
        } else {
            console.warn('No results found. Check if the search term is valid or selectors are correct.');
        }

    } catch (error) {
        console.error('Error running test:', error);
    }
})();

import { XzoneScraper } from './lib/scrapers/xzone';

async function test() {
    const scraper = new XzoneScraper();
    console.log('Testing Xzone Scraper...');
    try {
        const results = await scraper.search('Catan');
        console.log(`Found ${results.length} results:`);
        results.forEach(r => {
            console.log(`- ${r.name} (${r.price} ${r.currency}) - ${r.availability}`);
            console.log(`  Link: ${r.link}`);
            console.log(`  Image: ${r.imageUrl}`);
        });

        if (results.length > 0) {
            const first = results[0];
            if (!first.name || !first.price || !first.link || !first.imageUrl) {
                console.error('FAILED: Missing required fields in first result');
                process.exit(1);
            }
            if (!first.link.startsWith('http')) {
                console.error('FAILED: Link is not absolute');
                process.exit(1);
            }
            console.log('SUCCESS: Scraper returned valid data');
        } else {
            console.warn('WARNING: No results found (might be valid if no products match)');
        }
    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

test();

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });

    try {
        const homepageUrl = 'https://eshop.albi.sk/';
        console.log(`Navigating to ${homepageUrl}`);
        await page.goto(homepageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Type in search
        console.log('Typing search query...');
        // Selector from dump: .up-inp-text
        // Wait for it to be visible
        await page.waitForSelector('.up-inp-text', { visible: true, timeout: 10000 });
        await page.type('.up-inp-text', 'Catan');
        await page.keyboard.press('Enter');

        console.log('Search submitted, waiting for results...');

        // Wait for something that looks like a result or the search page
        // Based on previous dump, maybe just wait for navigation first
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Navigation complete. Waiting for product list...');

        // Try to wait for a generic product class if we can guess it, or just wait a bit
        // In Ludopolis it was .prod_holder. Here, let's look at the dump again if we can...
        // Actually, let's just wait 5 seconds to be safe if we don't know the selector
        await new Promise(r => setTimeout(r, 5000));

        // Take a screenshot
        console.log('Taking screenshot...');
        await page.screenshot({ path: 'albi_search_interaction.png' });

        // Dump HTML
        console.log('Dumping HTML...');
        const html = await page.content();
        fs.writeFileSync('albi_dump_interaction.html', html);

        console.log('Dumped HTML to albi_dump_interaction.html');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();

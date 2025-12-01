import puppeteer from 'puppeteer';
import fs from 'fs';

async function debug() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        const query = 'karak';
        const searchUrl = `https://www.imago.cz/hledani/${encodeURIComponent(query)}`;
        console.log(`Navigating to ${searchUrl}...`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('imago_cz_rendered.html', html);
        console.log('Saved imago_cz_rendered.html');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

debug();

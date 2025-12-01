const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // Show browser to see what happens
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        console.log('Going to Funtastic homepage...');
        await page.goto('https://www.funtastic.sk/', { waitUntil: 'networkidle2', timeout: 20000 });

        // Take screenshot of homepage
        await page.screenshot({ path: 'funtastic_homepage.png' });
        console.log('Screenshot saved');

        // Find and analyze search form
        const searchFormInfo = await page.evaluate(() => {
            const forms = Array.from(document.querySelectorAll('form'));
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"], input[name*="search"], input[placeholder*="hľad"]'));

            return {
                formCount: forms.length,
                forms: forms.map(f => ({
                    action: f.action,
                    method: f.method,
                    id: f.id
                })),
                inputs: inputs.map(inp => ({
                    name: inp.name,
                    id: inp.id,
                    type: inp.type,
                    placeholder: inp.placeholder
                }))
            };
        });

        console.log('\nSearch form info:', JSON.stringify(searchFormInfo, null, 2));

        // Try to search using form
        if (searchFormInfo.inputs.length > 0) {
            const firstInput = searchFormInfo.inputs[0];
            let selector = '';
            if (firstInput.id) selector = `#${firstInput.id}`;
            else if (firstInput.name) selector = `input[name="${firstInput.name}"]`;
            else selector = 'input[type="text"]';

            console.log(`\nTyping "Catan" into ${selector}...`);
            await page.type(selector, 'Catan', { delay: 100 });

            // Wait a bit for autocomplete
            await new Promise(r => setTimeout(r, 2000));

            // Take screenshot before submitting
            await page.screenshot({ path: 'funtastic_before_submit.png' });

            // Press Enter
            await page.keyboard.press('Enter');

            // Wait for navigation or AJAX
            try {
                await Promise.race([
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
                    new Promise(r => setTimeout(r, 10000))
                ]);
            } catch (e) {
                console.log('No navigation occurred');
            }

            await new Promise(r => setTimeout(r, 3000));

            const finalUrl = page.url();
            const bodyText = await page.evaluate(() => document.body.textContent);
            const catanCount = (bodyText.match(/catan/gi) || []).length;

            console.log(`\nAfter search:`);
            console.log(`URL: ${finalUrl}`);
            console.log(`"Catan" mentions: ${catanCount}`);

            await page.screenshot({ path: 'funtastic_after_search.png' });
            console.log('Screenshots saved');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await new Promise(r => setTimeout(r, 5000)); // Keep browser open to see result
        await browser.close();
    }
})();

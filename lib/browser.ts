import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

let browserInstance: any = null;

export async function getBrowser() {
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    if (process.env.NODE_ENV === 'production') {
        chromium.setGraphicsMode = false;
        browserInstance = await puppeteerCore.launch({
            args: [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Experimental but saves memory
                '--disable-extensions'
            ],
            defaultViewport: { width: 1920, height: 1080 },
            executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
            headless: true,
        });
    } else {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
        });
    }

    return browserInstance;
}

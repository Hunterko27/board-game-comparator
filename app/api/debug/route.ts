import { NextResponse } from 'next/server';
import { getBrowser } from '@/lib/browser';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Debug: Attempting to launch browser...');
        const browser = await getBrowser();
        const page = await browser.newPage();

        console.log('Debug: Navigating to example.com...');
        await page.goto('https://example.com');
        const title = await page.title();

        const version = await browser.version();

        await page.close();

        return NextResponse.json({
            status: 'ok',
            title,
            browserVersion: version,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        console.error('Debug: Browser launch failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

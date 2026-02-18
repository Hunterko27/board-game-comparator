
import { NextResponse } from 'next/server';

export async function GET() {
    const status: any = {};

    try {
        status.step = "Starting checks";

        try {
            const { AlbiScraper } = await import('@/lib/scrapers/albi');
            const scraper = new AlbiScraper();
            status.albi = `OK: ${scraper.name}`;
        } catch (e: any) {
            status.albi = `FAILED: ${e.message}`;
        }

        try {
            const { AlbiCZScraper } = await import('@/lib/scrapers/albi_cz');
            const scraper = new AlbiCZScraper();
            status.albiCz = `OK: ${scraper.name}`;
        } catch (e: any) {
            status.albiCz = `FAILED: ${e.message}`;
        }

        try {
            const { HrackyshopScraper } = await import('@/lib/scrapers/hrackyshop');
            const scraper = new HrackyshopScraper();
            status.hrackyshop = `OK: ${scraper.name}`;
        } catch (e: any) {
            status.hrackyshop = `FAILED: ${e.message}`;
        }

        try {
            const { VeselyDrakScraper } = await import('@/lib/scrapers/vesely_drak');
            const scraper = new VeselyDrakScraper();
            status.vesely = `OK: ${scraper.name}`;
        } catch (e: any) {
            status.vesely = `FAILED: ${e.message}`;
        }

        return NextResponse.json(status);

    } catch (globalError: any) {
        return NextResponse.json({
            fatal: "Global error in debug route",
            message: globalError.message,
            stack: globalError.stack
        }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { IhryskoScraper } from '@/lib/scrapers/ihrysko';
import { LudopolisScraper } from '@/lib/scrapers/ludopolis';
import { FuntasticScraper } from '@/lib/scrapers/funtastic';
import { MegaknihyScraper } from '@/lib/scrapers/megaknihy';
import { AlbiScraper } from '@/lib/scrapers/albi';
import { HrackyshopScraper } from '@/lib/scrapers/hrackyshop';
import { VeselyDrakScraper } from '@/lib/scrapers/vesely_drak';
import { DracikScraper } from '@/lib/scrapers/dracik';
import { ImagoScraper } from '@/lib/scrapers/imago';

import { NekonecnoScraper } from '@/lib/scrapers/nekonecno';
import { GorilaScraper } from '@/lib/scrapers/gorila';
import { XzoneScraper } from '@/lib/scrapers/xzone';
import { AlzaScraper } from '@/lib/scrapers/alza';
import { FyftScraper } from '@/lib/scrapers/fyft';
import { SvetHierScraper } from '@/lib/scrapers/svet_hier';
import { TlamaGamesScraper } from '@/lib/scrapers/tlamagames';

import { PlanetaHerScraper } from '@/lib/scrapers/planetaher';
import { SvetHerScraper } from '@/lib/scrapers/svether';

import { SvetDeskovychHerScraper } from '@/lib/scrapers/svet_deskovych_her';

import { AlbiCZScraper } from '@/lib/scrapers/albi_cz';
import { BohemianGamesScraper } from '@/lib/scrapers/bohemiangames';
import { OldDawgScraper } from '@/lib/scrapers/olddawg';
import { HrasScraper } from '@/lib/scrapers/hras';
import { NadesceScraper } from '@/lib/scrapers/nadesce';
import { HryDoRukyScraper } from '@/lib/scrapers/hrydoruky';
import { ImagoCZScraper } from '@/lib/scrapers/imago_cz';

import { OdhryScraper } from '@/lib/scrapers/odhry';
import { CechHracuScraper } from '@/lib/scrapers/cechhracu';
import { MysiDoupeScraper } from '@/lib/scrapers/mysidoupe';
import { DeskolandScraper } from '@/lib/scrapers/deskoland';
import { TabletopScraper } from '@/lib/scrapers/tabletop';
import { RerollScraper } from '@/lib/scrapers/reroll';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const exact = searchParams.get('exact') === 'true';
    const batchId = parseInt(searchParams.get('batchId') || '0');
    const totalBatches = parseInt(searchParams.get('totalBatches') || '1');

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const allScrapers = [
        new IhryskoScraper(),
        new LudopolisScraper(),
        new FuntasticScraper(),
        new MegaknihyScraper(),
        new AlbiScraper(),
        new AlbiCZScraper(),
        new BohemianGamesScraper(),
        new OldDawgScraper(),
        new HrasScraper(),
        new NadesceScraper(),
        new HryDoRukyScraper(),
        new ImagoCZScraper(),
        new HrackyshopScraper(),
        new VeselyDrakScraper(),
        new DracikScraper(),
        new ImagoScraper(),
        new NekonecnoScraper(),
        new GorilaScraper(),
        new XzoneScraper(),
        new AlzaScraper(),
        new FyftScraper(),
        new SvetHierScraper(),
        new TlamaGamesScraper(),
        new PlanetaHerScraper(),
        new SvetHerScraper(),
        new SvetDeskovychHerScraper(),
        new OdhryScraper(),
        new CechHracuScraper(),
        new MysiDoupeScraper(),
        new DeskolandScraper(),
        new TabletopScraper(),
        new RerollScraper(),
    ];

    // Calculate which scrapers to run for this batch
    const batchSize = Math.ceil(allScrapers.length / totalBatches);
    const startIdx = batchId * batchSize;
    const endIdx = Math.min(startIdx + batchSize, allScrapers.length);
    const scrapers = allScrapers.slice(startIdx, endIdx);

    console.log(`[API] Processing Batch ${batchId + 1}/${totalBatches} (Scrapers ${startIdx + 1}-${endIdx})`);

    const normalize = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            // Run all scrapers in this batch in parallel (since the batch itself is small)
            // We rely on the client to control the overall concurrency by how many batches it requests
            const searchPromises = scrapers.map(async (scraper) => {
                const startTime = Date.now();
                try {
                    console.log(`[${scraper.name}] Starting search...`);

                    // Add a timeout to prevent hanging the request
                    // 9s timeout ensures we finish before Netlify's 10s limit
                    const timeoutPromise = new Promise<any[]>((_, reject) => {
                        setTimeout(() => reject(new Error('Scraper timed out after 9s')), 9000);
                    });

                    let results = await Promise.race([
                        scraper.search(query),
                        timeoutPromise
                    ]);

                    const duration = Date.now() - startTime;
                    console.log(`[${scraper.name}] Finished in ${duration}ms. Found ${results.length} results.`);

                    if (exact) {
                        const normalizedQuery = normalize(query);
                        results = results.filter(r => normalize(r.name).includes(normalizedQuery));
                    }

                    if (results.length > 0) {
                        const json = JSON.stringify(results);
                        controller.enqueue(encoder.encode(json + '\n'));
                    }
                } catch (error: any) {
                    const duration = Date.now() - startTime;
                    console.error(`[${scraper.name}] Failed after ${duration}ms:`, error);
                    // Send error to client for debugging
                    const errorMsg = JSON.stringify({
                        type: 'error',
                        scraper: scraper.name,
                        message: error.message,
                        duration
                    });
                    controller.enqueue(encoder.encode(errorMsg + '\n'));
                }
            });

            await Promise.all(searchPromises);
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Transfer-Encoding': 'chunked',
        },
    });
}

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

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const scrapers = [
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

    const normalize = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const stream = new ReadableStream({
        async start(controller) {
            // Helper to process a batch of scrapers
            const processBatch = async (batch: typeof scrapers) => {
                const searchPromises = batch.map(async (scraper) => {
                    try {
                        let results = await scraper.search(query);

                        if (exact) {
                            const normalizedQuery = normalize(query);
                            results = results.filter(r => normalize(r.name).includes(normalizedQuery));
                        }

                        if (results.length > 0) {
                            const json = JSON.stringify(results);
                            controller.enqueue(new TextEncoder().encode(json + '\n'));
                        }
                    } catch (error) {
                        console.error(`Error in ${scraper.name}:`, error);
                    }
                });
                await Promise.all(searchPromises);
            };

            // Process scrapers in batches to avoid overwhelming the server (Netlify)
            // Puppeteer scrapers are resource intensive, so we limit concurrency.
            const BATCH_SIZE = 5;
            for (let i = 0; i < scrapers.length; i += BATCH_SIZE) {
                const batch = scrapers.slice(i, i + BATCH_SIZE);
                await processBatch(batch);
            }

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

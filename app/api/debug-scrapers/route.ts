
import { NextResponse } from 'next/server';

export async function GET() {
    const status: any = {};

    try {
        status.step = "Starting checks";

        // Batch 1
        try { const { IhryskoScraper } = await import('@/lib/scrapers/ihrysko'); new IhryskoScraper(); status.ihrysko = "OK"; } catch (e: any) { status.ihrysko = `FAILED: ${e.message}`; }
        try { const { LudopolisScraper } = await import('@/lib/scrapers/ludopolis'); new LudopolisScraper(); status.ludopolis = "OK"; } catch (e: any) { status.ludopolis = `FAILED: ${e.message}`; }
        try { const { FuntasticScraper } = await import('@/lib/scrapers/funtastic'); new FuntasticScraper(); status.funtastic = "OK"; } catch (e: any) { status.funtastic = `FAILED: ${e.message}`; }
        try { const { MegaknihyScraper } = await import('@/lib/scrapers/megaknihy'); new MegaknihyScraper(); status.megaknihy = "OK"; } catch (e: any) { status.megaknihy = `FAILED: ${e.message}`; }
        try { const { BohemianGamesScraper } = await import('@/lib/scrapers/bohemiangames'); new BohemianGamesScraper(); status.bohemian = "OK"; } catch (e: any) { status.bohemian = `FAILED: ${e.message}`; }
        try { const { OldDawgScraper } = await import('@/lib/scrapers/olddawg'); new OldDawgScraper(); status.olddawg = "OK"; } catch (e: any) { status.olddawg = `FAILED: ${e.message}`; }
        try { const { HrasScraper } = await import('@/lib/scrapers/hras'); new HrasScraper(); status.hras = "OK"; } catch (e: any) { status.hras = `FAILED: ${e.message}`; }
        try { const { NadesceScraper } = await import('@/lib/scrapers/nadesce'); new NadesceScraper(); status.nadesce = "OK"; } catch (e: any) { status.nadesce = `FAILED: ${e.message}`; }
        try { const { HryDoRukyScraper } = await import('@/lib/scrapers/hrydoruky'); new HryDoRukyScraper(); status.hrydoruky = "OK"; } catch (e: any) { status.hrydoruky = `FAILED: ${e.message}`; }
        try { const { ImagoCZScraper } = await import('@/lib/scrapers/imago_cz'); new ImagoCZScraper(); status.imagocz = "OK"; } catch (e: any) { status.imagocz = `FAILED: ${e.message}`; }

        // Batch 2
        try { const { DracikScraper } = await import('@/lib/scrapers/dracik'); new DracikScraper(); status.dracik = "OK"; } catch (e: any) { status.dracik = `FAILED: ${e.message}`; }
        try { const { ImagoScraper } = await import('@/lib/scrapers/imago'); new ImagoScraper(); status.imago = "OK"; } catch (e: any) { status.imago = `FAILED: ${e.message}`; }
        try { const { NekonecnoScraper } = await import('@/lib/scrapers/nekonecno'); new NekonecnoScraper(); status.nekonecno = "OK"; } catch (e: any) { status.nekonecno = `FAILED: ${e.message}`; }
        try { const { GorilaScraper } = await import('@/lib/scrapers/gorila'); new GorilaScraper(); status.gorila = "OK"; } catch (e: any) { status.gorila = `FAILED: ${e.message}`; }
        try { const { XzoneScraper } = await import('@/lib/scrapers/xzone'); new XzoneScraper(); status.xzone = "OK"; } catch (e: any) { status.xzone = `FAILED: ${e.message}`; }
        try { const { AlzaScraper } = await import('@/lib/scrapers/alza'); new AlzaScraper(); status.alza = "OK"; } catch (e: any) { status.alza = `FAILED: ${e.message}`; }
        try { const { FyftScraper } = await import('@/lib/scrapers/fyft'); new FyftScraper(); status.fyft = "OK"; } catch (e: any) { status.fyft = `FAILED: ${e.message}`; }
        try { const { SvetHierScraper } = await import('@/lib/scrapers/svet_hier'); new SvetHierScraper(); status.svethier = "OK"; } catch (e: any) { status.svethier = `FAILED: ${e.message}`; }
        try { const { TlamaGamesScraper } = await import('@/lib/scrapers/tlamagames'); new TlamaGamesScraper(); status.tlamagames = "OK"; } catch (e: any) { status.tlamagames = `FAILED: ${e.message}`; }

        // Batch 3
        try { const { PlanetaHerScraper } = await import('@/lib/scrapers/planetaher'); new PlanetaHerScraper(); status.planetaher = "OK"; } catch (e: any) { status.planetaher = `FAILED: ${e.message}`; }
        try { const { SvetHerScraper } = await import('@/lib/scrapers/svether'); new SvetHerScraper(); status.svether = "OK"; } catch (e: any) { status.svether = `FAILED: ${e.message}`; }
        try { const { SvetDeskovychHerScraper } = await import('@/lib/scrapers/svet_deskovych_her'); new SvetDeskovychHerScraper(); status.svetdeskovych = "OK"; } catch (e: any) { status.svetdeskovych = `FAILED: ${e.message}`; }
        try { const { OdhryScraper } = await import('@/lib/scrapers/odhry'); new OdhryScraper(); status.odhry = "OK"; } catch (e: any) { status.odhry = `FAILED: ${e.message}`; }
        try { const { CechHracuScraper } = await import('@/lib/scrapers/cechhracu'); new CechHracuScraper(); status.cechhracu = "OK"; } catch (e: any) { status.cechhracu = `FAILED: ${e.message}`; }
        try { const { MysiDoupeScraper } = await import('@/lib/scrapers/mysidoupe'); new MysiDoupeScraper(); status.mysidoupe = "OK"; } catch (e: any) { status.mysidoupe = `FAILED: ${e.message}`; }
        try { const { DeskolandScraper } = await import('@/lib/scrapers/deskoland'); new DeskolandScraper(); status.deskoland = "OK"; } catch (e: any) { status.deskoland = `FAILED: ${e.message}`; }
        try { const { TabletopScraper } = await import('@/lib/scrapers/tabletop'); new TabletopScraper(); status.tabletop = "OK"; } catch (e: any) { status.tabletop = `FAILED: ${e.message}`; }
        try { const { RerollScraper } = await import('@/lib/scrapers/reroll'); new RerollScraper(); status.reroll = "OK"; } catch (e: any) { status.reroll = `FAILED: ${e.message}`; }

        return NextResponse.json(status);

    } catch (globalError: any) {
        return NextResponse.json({
            fatal: "Global error in debug route",
            message: globalError.message,
            stack: globalError.stack
        }, { status: 500 });
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const ihrysko_1 = require("@/lib/scrapers/ihrysko");
const ludopolis_1 = require("@/lib/scrapers/ludopolis");
const funtastic_1 = require("@/lib/scrapers/funtastic");
const megaknihy_1 = require("@/lib/scrapers/megaknihy");
const albi_1 = require("@/lib/scrapers/albi");
const hrackyshop_1 = require("@/lib/scrapers/hrackyshop");
const vesely_drak_1 = require("@/lib/scrapers/vesely_drak");
const dracik_1 = require("@/lib/scrapers/dracik");
const imago_1 = require("@/lib/scrapers/imago");
const nekonecno_1 = require("@/lib/scrapers/nekonecno");
const gorila_1 = require("@/lib/scrapers/gorila");
const xzone_1 = require("@/lib/scrapers/xzone");
const alza_1 = require("@/lib/scrapers/alza");
const fyft_1 = require("@/lib/scrapers/fyft");
const svet_hier_1 = require("@/lib/scrapers/svet_hier");
const tlamagames_1 = require("@/lib/scrapers/tlamagames");
const planetaher_1 = require("@/lib/scrapers/planetaher");
const svether_1 = require("@/lib/scrapers/svether");
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    if (!query) {
        return server_1.NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }
    const scrapers = [
        new ihrysko_1.IhryskoScraper(),
        new ludopolis_1.LudopolisScraper(),
        new funtastic_1.FuntasticScraper(),
        new megaknihy_1.MegaknihyScraper(),
        new albi_1.AlbiScraper(),
        new hrackyshop_1.HrackyshopScraper(),
        new vesely_drak_1.VeselyDrakScraper(),
        new dracik_1.DracikScraper(),
        new imago_1.ImagoScraper(),
        new nekonecno_1.NekonecnoScraper(),
        new gorila_1.GorilaScraper(),
        new xzone_1.XzoneScraper(),
        new alza_1.AlzaScraper(),
        new fyft_1.FyftScraper(),
        new svet_hier_1.SvetHierScraper(),
        new tlamagames_1.TlamaGamesScraper(),
        new planetaher_1.PlanetaHerScraper(),
        new svether_1.SvetHerScraper(),
    ];
    try {
        const results = await Promise.all(scrapers.map(scraper => scraper.search(query)));
        const flatResults = results.flat();
        // Sort by price
        flatResults.sort((a, b) => a.price - b.price);
        return server_1.NextResponse.json(flatResults);
    }
    catch (error) {
        console.error('Search error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
